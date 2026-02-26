import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const rawBody = await request.clone().json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { sessionId, customer, lang, checkoutOption, paymentToken } =
      await request.json();

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      const { data: userData } = await supabaseAdmin.auth.getUser(token);

      if (userData?.user) {
        userId = userData.user.id;
      }
    }  

    if (!sessionId || !customer || !checkoutOption) {
      return NextResponse.json(
        { error: "Missing sessionId, customer, or checkoutOption" },
        { status: 400 }
      );
    }

    // Check if paid
    const requiresPayment = checkoutOption !== "CUSTOMER_NO_PAYMENT";

    if (requiresPayment && !paymentToken) {
      return NextResponse.json(
        { error: "Missing paymentToken" },
        { status: 400 }
      );
    }

    // 1. Obtener el carrito para confirmar que existe y extraer datos
    const cartPath = `/shopping-cart.json/session/${sessionId}`;
    const cartRes = await fetch(`${API_BASE}${cartPath}`, {
      method: "GET",
      ...signRequest(cartPath, "GET"),
    });

    if (!cartRes.ok) {
      const err = await cartRes.text();
      console.error("CART FETCH ERROR:", err);
      throw new Error("Failed to fetch cart");
    }

    const cartData = await cartRes.json();

    const activityBooking = cartData.activityBookings?.[0];
    if (!activityBooking) {
      return NextResponse.json(
        { error: "No activity booking in cart" },
        { status: 400 }
      );
    }

    // 2. Obtener las preguntas del carrito (para responderlas)
    const questionsPath = `/question.json/shopping-cart/${sessionId}`;
    const questionsRes = await fetch(`${API_BASE}${questionsPath}`, {
      method: "GET",
      ...signRequest(questionsPath, "GET"),
    });

    if (!questionsRes.ok) {
      const err = await questionsRes.text();
      console.error("SHOPPING CART QUESTIONS FETCH ERROR:", err);
      throw new Error("Failed to fetch shopping cart questions");
    }

    const questionsData = await questionsRes.json();

    // 3. Enviar respuestas al carrito
    const normalizedPhone =
      customer.phone.startsWith("+") ? customer.phone : `+48${customer.phone.replace(/\D/g, "")}`;

    const answersBody = {
      mainContactDetails: [
        { questionId: "firstName", values: [customer.firstName] },
        { questionId: "lastName", values: [customer.lastName] },
        { questionId: "email", values: [customer.email] },
        { questionId: "phoneNumber", values: [normalizedPhone] },
      ],
      activityBookings: [
        {
          bookingId: questionsData.activityBookings[0].bookingId,
          answers: [
            {
              questionId: "916875",
              values: ["Hotel not required - client will come to meeting point"],
            },
            {
              questionId: "926854",
              values: [lang === "es" ? "Spanish" : "English"],
            },
          ],
          passengers: questionsData.activityBookings[0].passengers.map((p: any) => ({
            bookingId: p.bookingId,
            passengerDetails: [
              { questionId: "firstName", values: [customer.firstName] },
              { questionId: "lastName", values: [customer.lastName] },
            ],
          })),
        },
      ],
    };

    const answerRes = await fetch(`${API_BASE}${questionsPath}`, {
      method: "POST",
      ...signRequest(questionsPath, "POST"),
      body: JSON.stringify(answersBody),
    });

    if (!answerRes.ok) {
      const err = await answerRes.text();
      console.error("ANSWER SUBMIT ERROR:", err);
      throw new Error("Failed to submit answers to cart");
    }

    // 4. GET checkout options
    const optionsPath = `/checkout.json/options/shopping-cart/${sessionId}?lang=${lang?.toUpperCase() || "EN"}`;
    const optionsRes = await fetch(`${API_BASE}${optionsPath}`, {
      method: "GET",
      ...signRequest(optionsPath, "GET"),
    });

    if (!optionsRes.ok) {
      const err = await optionsRes.text();
      console.error("CHECKOUT OPTIONS ERROR:", err);
      throw new Error("Failed to fetch checkout options");
    }

    const optionsData = await optionsRes.json();

    // Verifiy option
    const selectedOption = optionsData.options?.find((opt: any) => opt.type === checkoutOption);
    if (!selectedOption) {
      return NextResponse.json(
        { error: `Checkout option ${checkoutOption} not available` },
        { status: 400 }
      );
    }

    // 5. Extract UTI
    let uti = null;

    if (requiresPayment) {
      if (selectedOption.paymentMethods?.cardProvider?.uti) {
        uti = selectedOption.paymentMethods.cardProvider.uti;
      } else if (selectedOption.paymentMethods?.paymentProviders?.[0]?.uti) {
        uti = selectedOption.paymentMethods.paymentProviders[0].uti;
      }

      if (!uti) {
        return NextResponse.json(
          { error: "Missing UTI from checkout option" },
          { status: 400 }
        );
      }
    }

    // 6 Build URLs
    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/${lang}/checkout/success`;
    const cancelUrl = `${origin}/${lang}/checkout/cancel`;
    const errorUrl = `${origin}/${lang}/checkout/error`;

    // 7. Send checkout 
    const checkoutPath = `/checkout.json/submit`;
    
    let checkoutBody: any;

    if (requiresPayment) {
      checkoutBody = {
        checkoutOption,
        paymentMethod: "CARD",
        paymentToken,
        uti,
        source: "SHOPPING_CART",
        shoppingCart: {
          uuid: sessionId,
        },
        successUrl,
        cancelUrl,
        errorUrl,
      };
    } else {
      checkoutBody = {
        checkoutOption: "CUSTOMER_NO_PAYMENT",
        source: "SHOPPING_CART",
        shoppingCart: {
          uuid: sessionId,
        },
      };
    }

    const checkoutRes = await fetch(`${API_BASE}${checkoutPath}`, {
      method: "POST",
      ...signRequest(checkoutPath, "POST"),
      body: JSON.stringify(checkoutBody),
    });

    if (!checkoutRes.ok) {
      const err = await checkoutRes.text();
      console.error("CHECKOUT SUBMIT ERROR:", err);
      throw new Error("Checkout submission failed");
    }

    const checkoutData = await checkoutRes.json();

    // Save booking in Supabase (only if user is logged in)
    if (userId && checkoutData.booking?.confirmationCode) {
      await supabaseAdmin.from("bookings").insert({
        user_id: userId,
        activity_id: activityBooking.activityId?.toString() || null,
        confirmation_code: checkoutData.booking.confirmationCode,
        total: checkoutData.booking.totalPrice?.amount || null,
        currency: checkoutData.booking.totalPrice?.currency || null,
      });
    }

    // 8. LAST
    return NextResponse.json({
      success: true,
      booking: checkoutData.booking,
      invoice: checkoutData.invoice,
    });

  } catch (error) {
    console.error("CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: "Checkout submit failed" },
      { status: 500 }
    );
  }
}