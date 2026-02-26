import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function POST(request: Request) {
  try {
    const { sessionId, answers, contact } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const path = `/question.json/shopping-cart/${sessionId}`;

    // 1. Get official question structure
    const getRes = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      ...signRequest(path, "GET"),
    });

    if (!getRes.ok) {
      const err = await getRes.text();
      console.error("FETCH QUESTIONS ERROR:", err);
      return NextResponse.json(
        { error: "Failed to fetch cart questions" },
        { status: 500 }
      );
    }

    const questionsData = await getRes.json();
    const bookingBlock = questionsData.activityBookings?.[0];

    if (!bookingBlock) {
      return NextResponse.json(
        { error: "No activity booking found" },
        { status: 400 }
      );
    }

    // 2. Build full answers body

    const answersBody = {
      mainContactDetails: [
        { questionId: "firstName", values: [contact.firstName] },
        { questionId: "lastName", values: [contact.lastName] },
        { questionId: "email", values: [contact.email] },
        { questionId: "phoneNumber", values: [contact.phone] },
      ],

      activityBookings: [
        {
          bookingId: bookingBlock.bookingId,

          answers: bookingBlock.questions.map((q: any) => ({
            questionId: q.questionId,
            values: [answers[q.questionId] || ""],
          })),

          passengers: bookingBlock.passengers.map((p: any) => ({
            bookingId: p.bookingId,
            passengerDetails: p.passengerDetails.map((detail: any) => ({
              questionId: detail.questionId,
              values: [
                answers[`${p.bookingId}_${detail.questionId}`] ||
                  contact.firstName,
              ],
            })),
          })),
        },
      ],
    };

    // 3. Submit to Bokun
    const postRes = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      ...signRequest(path, "POST"),
      body: JSON.stringify(answersBody),
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      console.error("SUBMIT ANSWERS ERROR:", err);
      return NextResponse.json(
        { error: "Failed to submit answers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("CART ANSWERS ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Cart answers failed" },
      { status: 500 }
    );
  }
}