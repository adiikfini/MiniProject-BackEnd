import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDTO } from "./dto/create-event.dto";

export class EventService {
  prisma: PrismaService;
  cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getEvents = async () => {
    const events = await this.prisma.event.findMany();
    return events;
  };

  // createEvent = async (body: CreateEventDTO, image: Express.Multer.File) => {
  //   // 1. upload dlu ke cloudinary
  //   const { secure_url } = await this.cloudinaryService.upload(image);

  //   // 2. insert data ke db
  //   await this.prisma.event.create({
  //     data: { ...body, image: secure_url },
  //   });

  //   // 3. return message success
  //   return { message: "create product success" };
  // };
  createEvent = async (
    organizerUserId: number,
    body: CreateEventDTO,
    image: Express.Multer.File
  ) => {
    // 1️⃣ cari organizer profile
    const organizer = await this.prisma.eventOrganizer.findUnique({
      where: { user_id: organizerUserId },
    });

    if (!organizer) {
      throw new ApiError("Organizer profile not found", 404);
    }

    // 2️⃣ upload image
    const { secure_url } = await this.cloudinaryService.upload(image);

    // 3️⃣ create event
    await this.prisma.event.create({
      data: {
        organizer_id: organizer.organizer_id,
        name_price: body.name_price,
        price: body.price,
        is_paid: body.is_paid,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        total_seats: body.total_seats,
        available_seats: body.total_seats, // 🔥 PENTING
        description: body.description,
        location: body.location,
        category: body.category,
        image: secure_url,
      },
    });

    return { message: "Event created successfully" };
  };

  getMyEvents = async (userId: number) => {
    const organizer = await this.prisma.eventOrganizer.findUnique({
      where: { user_id: userId },
    });

    if (!organizer) throw new ApiError("Organizer not found", 404);

    return this.prisma.event.findMany({
      where: { organizer_id: organizer.organizer_id },
      include: {
        ticketTypes: true,
        _count: {
          select: { transactions: true },
        },
      },
    });
  };

  getEventAttendees = async (eventId: number, organizerUserId: number) => {
    // 1️⃣ pastiin organizer
    const organizer = await this.prisma.eventOrganizer.findUnique({
      where: { user_id: organizerUserId },
    });

    if (!organizer) throw new ApiError("Organizer not found", 404);

    // 2️⃣ pastiin event milik organizer
    const event = await this.prisma.event.findFirst({
      where: {
        event_id: eventId,
        organizer_id: organizer.organizer_id,
      },
    });

    if (!event) throw new ApiError("Event not found", 404);

    // 3️⃣ ambil attendee
    return this.prisma.transactionItem.findMany({
      where: {
        transaction: {
          event_id: eventId,
          status: "ACCEPTED",
        },
      },
      include: {
        ticketType: {
          select: { name: true },
        },
        transaction: {
          select: {
            transaction_date: true,
            final_amount: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        transaction: {
          transaction_date: "desc",
        },
      },
    });
  };
}
