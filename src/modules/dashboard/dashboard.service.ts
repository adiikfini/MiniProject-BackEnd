import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";

export class DashboardService {
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  getOrganizerSummary = async (userId: number) => {
    // 1️⃣ Ambil organizer
    const organizer = await this.prisma.eventOrganizer.findUnique({
      where: { user_id: userId },
    });

    if (!organizer) throw new ApiError("Organizer not found", 404);

    // 2️⃣ Total Events
    const totalEvents = await this.prisma.event.count({
      where: { organizer_id: organizer.organizer_id },
    });

    // 3️⃣ Total Revenue (ACCEPTED only)
    const revenueAgg = await this.prisma.transaction.aggregate({
      _sum: {
        final_amount: true,
      },
      where: {
        status: "ACCEPTED",
        event: {
          organizer_id: organizer.organizer_id,
        },
      },
    });

    const totalRevenue = Number(revenueAgg._sum.final_amount ?? 0);

    // 4️⃣ Total Tickets Sold
    const ticketsAgg = await this.prisma.transactionItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        transaction: {
          status: "ACCEPTED",
          event: {
            organizer_id: organizer.organizer_id,
          },
        },
      },
    });

    const totalTicketsSold = ticketsAgg._sum.quantity ?? 0;

    // 5️⃣ Total Vouchers
    const totalVouchers = await this.prisma.voucher.count({
      where: {
        organizer_id: organizer.organizer_id,
      },
    });

    // 6️⃣ Revenue per Month
    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: "ACCEPTED",
        event: {
          organizer_id: organizer.organizer_id,
        },
      },
      select: {
        final_amount: true,
        transaction_date: true,
      },
    });

    const revenueByMonthMap: Record<string, number> = {};

    transactions.forEach((trx) => {
      const month = trx.transaction_date.toLocaleString("en-US", {
        month: "short",
      });

      revenueByMonthMap[month] =
        (revenueByMonthMap[month] ?? 0) + Number(trx.final_amount);
    });

    const revenueByMonth = Object.entries(revenueByMonthMap).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

    return {
      totalRevenue,
      totalEvents,
      totalTicketsSold,
      totalVouchers,
      revenueByMonth,
    };
  };
}
