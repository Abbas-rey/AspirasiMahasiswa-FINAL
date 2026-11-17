const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Categories
  const categoriesData = [
    { category_name: 'Akademik', description: 'Kurikulum, KRS, jadwal kuliah, perkuliahan, dan ujian' },
    { category_name: 'Dosen', description: 'Pelayanan pengajaran, pembimbingan akademik & skripsi dosen' },
    { category_name: 'Fasilitas', description: 'Ruang kelas, pendingin ruangan (AC), proyektor, laboratorium' },
    { category_name: 'Administrasi', description: 'Layanan tata usaha, surat pengantar, transkrip, dan ijazah' },
    { category_name: 'Sarana Prasarana', description: 'Toilet, musholla, parkiran, kantin, dan lingkungan kampus' },
    { category_name: 'Lainnya', description: 'Aspirasi, saran, dan masukan umum civitas akademika' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { category_name: cat.category_name },
      update: cat,
      create: cat,
    });
  }
  console.log('Categories seeded.');

  const catMap = {};
  const allCats = await prisma.category.findMany();
  for (const c of allCats) {
    catMap[c.category_name] = c.id;
  }

  // 2. Users
  const salt = await bcrypt.genSalt(10);

  // Admin
  const adminHash = await bcrypt.hash('admin123', salt);
  const adminUser = await prisma.user.upsert({
    where: { nim_nip: 'admin' },
    update: { password_hash: adminHash, must_change_pwd: true },
    create: {
      nim_nip: 'admin',
      name: 'Administrator Pusat Sistem ASMA',
      email: 'admin@uinjkt.ac.id',
      password_hash: adminHash,
      role: 'ADMIN',
      must_change_pwd: true,
    },
  });

  // Mahasiswa 1 (Achmad Suva)
  const mhs1Hash = await bcrypt.hash('Uin1251420044', salt);
  const mhs1 = await prisma.user.upsert({
    where: { nim_nip: '1251420044' },
    update: { password_hash: mhs1Hash, must_change_pwd: true },
    create: {
      nim_nip: '1251420044',
      name: 'Achmad Suva',
      email: 'achmad.suva@mhs.uinjkt.ac.id',
      password_hash: mhs1Hash,
      role: 'MAHASISWA',
      must_change_pwd: true,
    },
  });

  // Mahasiswa 2 (Fathia Rahma - must_change_pwd = true to test prompt modal)
  const mhs2Hash = await bcrypt.hash('Uin1251420001', salt);
  const mhs2 = await prisma.user.upsert({
    where: { nim_nip: '1251420001' },
    update: { password_hash: mhs2Hash, must_change_pwd: true },
    create: {
      nim_nip: '1251420001',
      name: 'Fathia Rahma',
      email: 'fathia.rahma@mhs.uinjkt.ac.id',
      password_hash: mhs2Hash,
      role: 'MAHASISWA',
      must_change_pwd: true,
    },
  });

  // Mahasiswa 3 (Dimas Pratama)
  const mhs3Hash = await bcrypt.hash('Uin1251420099', salt);
  const mhs3 = await prisma.user.upsert({
    where: { nim_nip: '1251420099' },
    update: { password_hash: mhs3Hash, must_change_pwd: true },
    create: {
      nim_nip: '1251420099',
      name: 'Dimas Pratama',
      email: 'dimas.pratama@mhs.uinjkt.ac.id',
      password_hash: mhs3Hash,
      role: 'MAHASISWA',
      must_change_pwd: true,
    },
  });

  // Akademisi 1 (Kaprodi TI - Jurusan)
  const dosen1Hash = await bcrypt.hash('Uin198503152010121002', salt);
  const dosen1 = await prisma.user.upsert({
    where: { nim_nip: '198503152010121002' },
    update: { password_hash: dosen1Hash, must_change_pwd: true },
    create: {
      nim_nip: '198503152010121002',
      name: 'Dr. Husni Teja Sukmana, S.T., M.Sc., Ph.D.',
      email: 'husni.teja@uinjkt.ac.id',
      password_hash: dosen1Hash,
      role: 'AKADEMISI',
      scope_level: 'JURUSAN',
      must_change_pwd: true,
    },
  });

  // Akademisi 2 (Wakil Dekan - Fakultas Sains dan Teknologi)
  const dosen2Hash = await bcrypt.hash('Uin197608222005011003', salt);
  const dosen2 = await prisma.user.upsert({
    where: { nim_nip: '197608222005011003' },
    update: { password_hash: dosen2Hash, must_change_pwd: true },
    create: {
      nim_nip: '197608222005011003',
      name: 'Prof. Dr. Frans Sudirjo, M.Kom.',
      email: 'frans.sudirjo@uinjkt.ac.id',
      password_hash: dosen2Hash,
      role: 'AKADEMISI',
      scope_level: 'FAKULTAS',
      must_change_pwd: true,
    },
  });

  // Akademisi 3 (Biro Kemahasiswaan & Sarana - Universitas)
  const dosen3Hash = await bcrypt.hash('Uin197001011995031001', salt);
  const dosen3 = await prisma.user.upsert({
    where: { nim_nip: '197001011995031001' },
    update: { password_hash: dosen3Hash, must_change_pwd: true },
    create: {
      nim_nip: '197001011995031001',
      name: 'Drs. H. Mamat Salam, M.Si.',
      email: 'mamat.salam@uinjkt.ac.id',
      password_hash: dosen3Hash,
      role: 'AKADEMISI',
      scope_level: 'UNIVERSITAS',
      must_change_pwd: false,
    },
  });

  console.log('Users seeded.');

  // 3. Sample Aspirations
  const asp1 = await prisma.aspiration.upsert({
    where: { ticket_code: 'ASP-2026-004812' },
    update: {},
    create: {
      ticket_code: 'ASP-2026-004812',
      user_id: mhs1.id,
      category_id: catMap['Fasilitas'],
      target_level: 'JURUSAN',
      is_anonymous: false,
      title: 'AC di Ruang Lab Komputer 3 Rusak dan Panas',
      description: 'Saat praktikum Jaringan Komputer hari Selasa siang, AC di Lab 3 tidak dingin sama sekali dan mengeluarkan suara dengung kencang sehingga mahasiswa kesulitan berkonsentrasi.',
      incident_date: new Date('2026-11-10T13:30:00Z'),
      incident_time: '13:30 WIB',
      current_status: 'DIPROSES',
      status_logs: {
        create: [
          {
            status: 'DITERIMA',
            note: 'Aspirasi masuk dan diverifikasi oleh admin prodi.',
            updated_by_name: 'Sistem ASMA',
            changed_at: new Date('2026-11-10T14:00:00Z'),
          },
          {
            status: 'DIPROSES',
            note: 'Petugas teknisi sarana TI sedang memeriksa freon dan kipas kompresor AC Lab 3.',
            updated_by_name: 'Dr. Husni Teja Sukmana, S.T., M.Sc., Ph.D.',
            changed_at: new Date('2026-11-11T09:15:00Z'),
          },
        ],
      },
      responses: {
        create: [
          {
            responder_id: dosen1.id,
            response_text: 'Terima kasih informasinya. Surat permintaan perbaikan telah diteruskan ke bagian pemeliharaan gedung FST. Estimasi selesai perbaikan hari Jumat.',
            responded_at: new Date('2026-11-11T09:15:00Z'),
          },
        ],
      },
    },
  });

  const asp2 = await prisma.aspiration.upsert({
    where: { ticket_code: 'ASP-2026-007194' },
    update: {},
    create: {
      ticket_code: 'ASP-2026-007194',
      user_id: mhs1.id,
      category_id: catMap['Akademik'],
      target_level: 'FAKULTAS',
      is_anonymous: true,
      title: 'Keterlambatan Input Nilai Ujian Susulan Semester Ganjil',
      description: 'Beberapa mahasiswa belum mendapatkan update nilai ujian susulan di portal AIS UIN padahal masa pengisian KRS semester baru akan segera ditutup minggu depan.',
      incident_date: new Date('2026-11-08T10:00:00Z'),
      incident_time: '10:00 WIB',
      current_status: 'DITINDAKLANJUTI',
      status_logs: {
        create: [
          {
            status: 'DITERIMA',
            note: 'Aspirasi diterima bagian akademik fakultas.',
            updated_by_name: 'Sistem ASMA',
            changed_at: new Date('2026-11-08T10:30:00Z'),
          },
          {
            status: 'DIPROSES',
            note: 'Sedang berkoordinasi dengan dosen pengampu mata kuliah terkait.',
            updated_by_name: 'Prof. Dr. Frans Sudirjo, M.Kom.',
            changed_at: new Date('2026-11-09T11:00:00Z'),
          },
          {
            status: 'DITINDAKLANJUTI',
            note: 'Dosen terkait telah menyelesaikan input nilai dan berkas sudah dikirim ke bagian PUSTIPD.',
            updated_by_name: 'Prof. Dr. Frans Sudirjo, M.Kom.',
            changed_at: new Date('2026-11-12T14:20:00Z'),
          },
        ],
      },
      responses: {
        create: [
          {
            responder_id: dosen2.id,
            response_text: 'Halo, dosen pengampu telah mengunggah nilai dan kami minta PUSTIPD untuk sinkronisasi nilai ke AIS malam ini. Silakan periksa berkala besok pagi.',
            responded_at: new Date('2026-11-12T14:20:00Z'),
          },
        ],
      },
    },
  });

  const asp3 = await prisma.aspiration.upsert({
    where: { ticket_code: 'ASP-2026-001055' },
    update: {},
    create: {
      ticket_code: 'ASP-2026-001055',
      user_id: mhs3.id,
      category_id: catMap['Sarana Prasarana'],
      target_level: 'UNIVERSITAS',
      is_anonymous: false,
      title: 'Lampu Penerangan Lapangan Parkir Timur Mati Total',
      description: 'Penerangan di area parkiran timur kampus utama mati sejak 3 hari lalu. Area sangat gelap saat malam hari dan berisiko terhadap keamanan kendaraan mahasiswa.',
      incident_date: new Date('2026-11-05T19:00:00Z'),
      incident_time: '19:00 WIB',
      current_status: 'SELESAI',
      status_logs: {
        create: [
          {
            status: 'DITERIMA',
            note: 'Laporan dicatat petugas keamanan dan diteruskan ke Biro Umum.',
            updated_by_name: 'Sistem ASMA',
            changed_at: new Date('2026-11-06T08:00:00Z'),
          },
          {
            status: 'DIPROSES',
            note: 'Penggantian modul lampu LED sorot oleh tim teknisi listrik universitas.',
            updated_by_name: 'Drs. H. Mamat Salam, M.Si.',
            changed_at: new Date('2026-11-06T13:00:00Z'),
          },
          {
            status: 'SELESAI',
            note: 'Seluruh 4 titik lampu sorot sudah diganti baru dan menyala normal.',
            updated_by_name: 'Drs. H. Mamat Salam, M.Si.',
            changed_at: new Date('2026-11-07T16:00:00Z'),
          },
        ],
      },
      responses: {
        create: [
          {
            responder_id: dosen3.id,
            response_text: 'Lampu sorot LED berdaya 150W telah berhasil dipasang di keempat tiang parkir timur. Kondisi sekarang terang benderang dan aman. Terima kasih atas laporannya!',
            responded_at: new Date('2026-11-07T16:00:00Z'),
          },
        ],
      },
    },
  });

  const asp4 = await prisma.aspiration.upsert({
    where: { ticket_code: 'ASP-2026-009413' },
    update: {},
    create: {
      ticket_code: 'ASP-2026-009413',
      user_id: mhs2.id,
      category_id: catMap['Administrasi'],
      target_level: 'JURUSAN',
      is_anonymous: true,
      title: 'Permohonan Mempercepat Tanda Tangan Surat Bebas Lab',
      description: 'Mohon agar alur permohonan surat bebas lab untuk yudisium dipercepat karena calon wisudawan harus mengejar deadline pendaftaran wisuda ke-135.',
      incident_date: new Date('2026-11-12T09:00:00Z'),
      incident_time: '09:00 WIB',
      current_status: 'DITERIMA',
      status_logs: {
        create: [
          {
            status: 'DITERIMA',
            note: 'Aspirasi baru masuk, menunggu telaah dari Kaprodi.',
            updated_by_name: 'Sistem ASMA',
            changed_at: new Date('2026-11-12T09:30:00Z'),
          },
        ],
      },
    },
  });

  console.log('Sample aspirations seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
