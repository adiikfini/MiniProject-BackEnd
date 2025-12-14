import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Mendapatkan angka random
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Mendapatkan elemen random dari array
const randomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🚀 Memulai Massive Seeding (TypeScript)...');

  // ==========================================================
  // 1. CLEANUP (Hapus data lama)
  // ==========================================================
  // Kita hapus satu per satu untuk menghindari masalah Foreign Key
  const deleteOperations = [
    prisma.transactionItem.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.userCoupon.deleteMany(),
    prisma.rewardCoupon.deleteMany(),
    prisma.review.deleteMany(),
    prisma.voucher.deleteMany(),
    prisma.ticketType.deleteMany(),
    prisma.event.deleteMany(),
    prisma.eventOrganizer.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.pointHistory.deleteMany(),
    prisma.user.deleteMany(),
  ];

  try {
    await prisma.$transaction(deleteOperations);
    console.log('🧹 Data lama berhasil dibersihkan.');
  } catch (error) {
    console.log('⚠️  Data mungkin sudah kosong atau ada error saat pembersihan (lanjut...)');
  }

  // ==========================================================
  // 2. CREATE USERS (15 Users)
  // ==========================================================
  console.log('👤 Creating 15 Users...');
  
  // Kita simpan user yang dibuat ke array untuk referensi nanti
  const createdUsers = [];

  for (let i = 1; i <= 15; i++) {
    const role = i <= 5 ? 'ORGANIZER' : 'CUSTOMER'; // 5 pertama Organizer
    
    const user = await prisma.user.create({
      data: {
        name: role === 'ORGANIZER' ? `Organizer ${i}` : `Customer User ${i}`,
        email: `user${i}@example.com`,
        password_hash: '$2b$10$EpRnTzVlqHNP0.fKbXTn3.eltNwKqHr/Nor3lI72E.7', // Dummy hash
        role: role,
        phone_number: `0812345678${i.toString().padStart(2, '0')}`,
        refferal_code: `REF${i}${randomInt(1000, 9999)}`,
        point_balance: role === 'CUSTOMER' ? randomInt(0, 100000) : 0,
      }
    });
    createdUsers.push(user);
  }

  // Pisahkan user berdasarkan peran
  const organizersUsers = createdUsers.filter(u => u.role === 'ORGANIZER');
  const customerUsers = createdUsers.filter(u => u.role === 'CUSTOMER');

  // ==========================================================
  // 3. CREATE ORGANIZERS (5 Profiles)
  // ==========================================================
  console.log('🏢 Creating Organizer Profiles...');
  
  const createdOrganizers = [];
  
  for (const user of organizersUsers) {
    const org = await prisma.eventOrganizer.create({
      data: {
        user_id: user.user_id,
        company_name: `${user.name} Corp`,
        description: `Kami adalah organizer profesional terbaik nomor ${user.user_id}`,
        rating_average: randomInt(30, 50) / 10, // Rating 3.0 - 5.0
      }
    });
    createdOrganizers.push(org);
  }

  // ==========================================================
  // 4. CREATE EVENTS & TICKETS (10 Events)
  // ==========================================================
  console.log('🎉 Creating Events, Tickets & Vouchers...');
  
  const createdEvents = [];
  const categories = ['Music', 'Seminar', 'Sports', 'Workshop', 'Exhibition'];
  const locations = ['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Medan'];

  for (const org of createdOrganizers) {
    // Setiap organizer membuat 2 event
    for (let k = 1; k <= 2; k++) {
      const isPaid = Math.random() > 0.3; // 70% Berbayar
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + randomInt(5, 60)); // Event 5-60 hari ke depan

      const event = await prisma.event.create({
        data: {
          organizer_id: org.organizer_id,
          name_price: `Event ${randomElement(categories)} Vol.${k} by ${org.company_name}`,
          price: isPaid ? randomInt(50000, 500000) : 0,
          is_paid: isPaid,
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Event seru wajib datang!',
          location: randomElement(locations),
          category: randomElement(categories),
          start_date: eventDate,
          end_date: new Date(new Date(eventDate).setHours(eventDate.getHours() + 4)),
          total_seats: 500,
          available_seats: 450,

          // Nested create TicketType
          ticketTypes: {
            create: [
              {
                name: 'Regular',
                price: isPaid ? 50000 : 0,
                quantity: 400,
                available_quantity: 350,
              },
              {
                name: 'VIP',
                price: isPaid ? 150000 : 0,
                quantity: 100,
                available_quantity: 100,
              }
            ]
          },

          // Nested create Voucher (1 per event)
          vouchers: {
            create: {
              organizer_id: org.organizer_id,
              code_voucher: `PROMO${org.organizer_id}${k}${randomInt(10,99)}`,
              discount_percentage: 10,
              max_discount_amount: 20000,
              start_date: new Date(),
              usage_limit: 100,
              used_count: 0
            }
          }
        },
        include: { ticketTypes: true } // Return tiket agar bisa dipakai transaksi
      });
      createdEvents.push(event);
    }
  }

  // ==========================================================
  // 5. CREATE GLOBAL REWARD COUPONS
  // ==========================================================
  console.log('🎟️ Creating Reward Coupons...');
  
  await prisma.rewardCoupon.createMany({
    data: [
      { code: 'WELCOME2024', discount_percentage: 50, max_discount_amount: 50000, expiration_date: new Date('2025-12-31') },
      { code: 'PAYDAY', discount_percentage: 25, max_discount_amount: 25000, expiration_date: new Date('2025-06-30') },
      { code: 'WEEKEND', discount_percentage: 10, max_discount_amount: 10000, expiration_date: new Date('2025-08-17') },
    ]
  });

  // ==========================================================
  // 6. CREATE TRANSACTIONS (25 Transaksi)
  // ==========================================================
  console.log('💸 Creating Random Transactions...');

  for (let i = 0; i < 25; i++) {
    const user = randomElement(customerUsers);
    const event = randomElement(createdEvents);
    const ticket = randomElement(event.ticketTypes); // Ambil salah satu tiket dari event
    
    const qty = randomInt(1, 3);
    const totalPrice = Number(ticket.price) * qty;

    await prisma.transaction.create({
      data: {
        user_id: user.user_id,
        event_id: event.event_id,
        total_amount: totalPrice,
        final_amount: totalPrice, // Asumsi tanpa diskon dulu
        status: randomElement(['PENDING', 'PAID', 'CANCELLED', 'WAITING_ADMIN']),
        transaction_date: new Date(),
        
        transactionItems: {
          create: {
            tiket_id: ticket.tiket_id,
            quantity: qty,
            price_per_tiket: ticket.price
          }
        }
      }
    });
  }

  // ==========================================================
  // 7. CREATE REVIEWS (15 Reviews)
  // ==========================================================
  console.log('⭐ Creating Reviews...');

  for (let i = 0; i < 15; i++) {
    const user = randomElement(customerUsers);
    const event = randomElement(createdEvents);

    await prisma.review.create({
      data: {
        user_id: user.user_id,
        event_id: event.event_id,
        rating: randomInt(3, 5),
        comment: randomElement([
          'Event yang sangat luar biasa!',
          'Tempatnya nyaman, sound system oke.',
          'Agak telat mulainya, tapi artisnya keren.',
          'Recommended banget buat tahun depan.',
          'Lumayanlah untuk harga segini.'
        ]),
        review_date: new Date()
      }
    });
  }

  // ==========================================================
  // 8. CREATE REFERRALS
  // ==========================================================
  console.log('🔗 Creating Referrals...');
  
  // User customer pertama mengajak user customer kedua
  if (customerUsers.length >= 2) {
    await prisma.referral.create({
      data: {
        referrer_user_id: customerUsers[0].user_id,
        referred_user_id: customerUsers[1].user_id,
        status: 'SUCCESS',
        referred_at: new Date()
      }
    });
  }

  console.log('✅ SEEDING SELESAI! Database telah terisi data dummy.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });