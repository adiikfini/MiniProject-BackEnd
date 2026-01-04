import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { TransactionStatus } from "@prisma/client";

export class TransactionService {
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  /* ============================
     GET TRANSACTIONS (ORGANIZER)
  ============================ */
  getOrganizerTransactions = async (organizerUserId: number) => {
    const organizer = await this.prisma.eventOrganizer.findUnique({
      where: { user_id: organizerUserId },
    });

    if (!organizer) throw new ApiError("Organizer not found", 404);

    return this.prisma.transaction.findMany({
      where: {
        event: {
          organizer_id: organizer.organizer_id,
        },
      },
      include: {
        user: true,
        event: true,
        transactionItems: {
          include: { ticketType: true },
        },
      },
      orderBy: { transaction_date: "desc" },
    });
  };

  /* ============================
     ACCEPT TRANSACTION
  ============================ */
  acceptTransaction = async (transactionId: number) => {
    const trx = await this.prisma.transaction.findUnique({
      where: { transaction_id: transactionId },
    });

    if (!trx) throw new ApiError("Transaction not found", 404);
    if (trx.status !== TransactionStatus.PENDING)
      throw new ApiError("Transaction already processed", 400);

    return this.prisma.transaction.update({
      where: { transaction_id: transactionId },
      data: {
        status: TransactionStatus.ACCEPTED,
      },
    });
  };

  /* ============================
     REJECT TRANSACTION (ROLLBACK)
  ============================ */
  rejectTransaction = async (transactionId: number) => {
    const trx = await this.prisma.transaction.findUnique({
      where: { transaction_id: transactionId },
      include: {
        transactionItems: true,
      },
    });

    if (!trx) throw new ApiError("Transaction not found", 404);
    if (trx.status !== TransactionStatus.PENDING)
      throw new ApiError("Transaction already processed", 400);

    return this.prisma.$transaction(async (tx) => {
      /* 1️⃣ BALIKIN SEAT */
      await tx.event.update({
        where: { event_id: trx.event_id },
        data: {
          available_seats: {
            increment: trx.transactionItems.reduce(
              (sum, i) => sum + i.quantity,
              0
            ),
          },
        },
      });

      /* 2️⃣ BALIKIN TICKET TYPE */
      for (const item of trx.transactionItems) {
        await tx.ticketType.update({
          where: { tiket_id: item.tiket_id },
          data: {
            available_quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      /* 3️⃣ BALIKIN POINT */
      if (trx.point_used > 0) {
        await tx.user.update({
          where: { user_id: trx.user_id },
          data: {
            point_balance: {
              increment: trx.point_used,
            },
          },
        });

        await tx.pointHistory.create({
          data: {
            user_id: trx.user_id,
            amount: trx.point_used,
            type: "REFUND",
            description: "Transaction rejected",
            expires_at: new Date(
              new Date().setMonth(new Date().getMonth() + 3)
            ),
          },
        });
      }

      /* 4️⃣ BALIKIN COUPON */
      if (trx.coupon_id) {
        await tx.userCoupon.updateMany({
          where: {
            user_id: trx.user_id,
            coupon_id: trx.coupon_id,
          },
          data: {
            is_used: false,
            used_date: null,
          },
        });
      }

      /* 5️⃣ BALIKIN VOUCHER */
      if (trx.voucher_id) {
        await tx.voucher.update({
          where: { voucher_id: trx.voucher_id },
          data: {
            used_count: {
              decrement: 1,
            },
          },
        });
      }

      /* 6️⃣ UPDATE STATUS */
      return tx.transaction.update({
        where: { transaction_id: transactionId },
        data: {
          status: TransactionStatus.REJECTED,
        },
      });
    });
  };
}
