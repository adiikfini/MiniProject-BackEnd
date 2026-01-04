import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVoucherDTO } from "./dto/create.voucher.dto";

export class VoucherService {
  prisma: PrismaService;
  cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getVouchers = async () => {
    const voucher = await this.prisma.voucher.findMany();
    return voucher;
  };

  createVoucher = async (body: CreateVoucherDTO) => {
    await this.prisma.voucher.create({
      data: {
        organizer_id: body.organizer_id,
        event_id: body.event_id,
        code_voucher: body.code_voucher,
        discount_percentage: body.discount_percentage,
        max_discount_amount: body.max_discount_amount,
        start_date: body.start_date,
        usage_limit: body.usage_limit,
      },
    });

    return { message: "create voucher success" };
  };
}
