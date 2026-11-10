import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Opt = [string, boolean];
type Q = { q: string; e: string; opts: Opt[] };

const DEMO_STUDENTS = [
  { name: "Alya Putri Ramadhani", username: "alya.ramadhani", email: "alya.ramadhani@biolearn.id", password: "BioSiswa01" },
  { name: "Bagas Pratama Nugraha", username: "bagas.nugraha", email: "bagas.nugraha@biolearn.id", password: "BioSiswa02" },
  { name: "Citra Ayu Lestari", username: "citra.lestari", email: "citra.lestari@biolearn.id", password: "BioSiswa03" },
  { name: "Daffa Rizky Maulana", username: "daffa.maulana", email: "daffa.maulana@biolearn.id", password: "BioSiswa04" },
  { name: "Eka Safitri Wulandari", username: "eka.wulandari", email: "eka.wulandari@biolearn.id", password: "BioSiswa05" },
  { name: "Farhan Alif Pratama", username: "farhan.pratama", email: "farhan.pratama@biolearn.id", password: "BioSiswa06" },
  { name: "Gita Permata Sari", username: "gita.sari", email: "gita.sari@biolearn.id", password: "BioSiswa07" },
  { name: "Hafiz Ahmad Fauzan", username: "hafiz.fauzan", email: "hafiz.fauzan@biolearn.id", password: "BioSiswa08" },
  { name: "Intan Nur Aulia", username: "intan.aulia", email: "intan.aulia@biolearn.id", password: "BioSiswa09" },
  { name: "Jihan Nabila Putri", username: "jihan.putri", email: "jihan.putri@biolearn.id", password: "BioSiswa10" },
  { name: "Kirana Putri Maharani", username: "kirana.maharani", email: "kirana.maharani@biolearn.id", password: "BioSiswa11" },
  { name: "Luthfi Ramadhan", username: "luthfi.ramadhan", email: "luthfi.ramadhan@biolearn.id", password: "BioSiswa12" },
  { name: "Maya Oktaviani", username: "maya.oktaviani", email: "maya.oktaviani@biolearn.id", password: "BioSiswa13" },
  { name: "Naufal Akbar", username: "naufal.akbar", email: "naufal.akbar@biolearn.id", password: "BioSiswa14" },
  { name: "Nadia Syahputri", username: "nadia.syahputri", email: "nadia.syahputri@biolearn.id", password: "BioSiswa15" },
  { name: "Rafi Aditya", username: "rafi.aditya", email: "rafi.aditya@biolearn.id", password: "BioSiswa16" },
  { name: "Salsabila Zahra", username: "salsabila.zahra", email: "salsabila.zahra@biolearn.id", password: "BioSiswa17" },
  { name: "Tegar Pamungkas", username: "tegar.pamungkas", email: "tegar.pamungkas@biolearn.id", password: "BioSiswa18" },
  { name: "Vina Amelia", username: "vina.amelia", email: "vina.amelia@biolearn.id", password: "BioSiswa19" },
  { name: "Yoga Prakoso", username: "yoga.prakoso", email: "yoga.prakoso@biolearn.id", password: "BioSiswa20" },
];

const DEMO_TEACHERS = [
  { name: "Friskila Uliana", username: "teacher01", email: "teacher01@biolearn.id" },
  { name: "Anzalina Viena Rahmatika", username: "teacher02", email: "teacher02@biolearn.id" },
  { name: "Nathasya Febriani", username: "teacher03", email: "teacher03@biolearn.id" },
];

const PRETEST: Q[] = [
  {
    q: "Dalam praktikum, siswa menutup sebagian daun tanaman dengan aluminium foil dan membiarkan bagian lain terkena cahaya. Setelah diuji dengan lugol, hanya bagian yang terkena cahaya berubah biru kehitaman. Organel apakah yang paling langsung berperan dalam proses yang menghasilkan zat tersebut?",
    e: "Kloroplas mengandung klorofil dan menjadi tempat fotosintesis yang menghasilkan glukosa untuk disimpan sebagai amilum.",
    opts: [
      ["Kloroplas", true],
      ["Mitokondria", false],
      ["Nukleus", false],
      ["Ribosom", false],
    ],
  },
  {
    q: "Sel otot seorang pelari bekerja sangat aktif saat berlari dan membutuhkan banyak energi. Jika dibandingkan dengan sel yang kurang aktif, organel apakah yang kemungkinan lebih banyak ditemukan karena berperan menghasilkan ATP?",
    e: "Mitokondria menghasilkan ATP melalui respirasi seluler; sel dengan kebutuhan energi tinggi umumnya memiliki banyak mitokondria.",
    opts: [
      ["Lisosom", false],
      ["Badan Golgi", false],
      ["Mitokondria", true],
      ["Vakuola", false],
    ],
  },
  {
    q: "Potongan jaringan tumbuhan dimasukkan ke larutan pekat. Setelah beberapa saat, air keluar dari sel dan isi sel menyusut, sementara dinding sel tetap tampak. Struktur apakah yang mengatur perpindahan zat secara selektif pada peristiwa ini?",
    e: "Membran sel bersifat selektif permeabel sehingga mengatur perpindahan air dan zat terlarut, termasuk pada osmosis.",
    opts: [
      ["Dinding sel", false],
      ["Membran sel", true],
      ["Sitoplasma", false],
      ["Nukleolus", false],
    ],
  },
  {
    q: "Pada irisan daun, siswa membandingkan jaringan tepat di bawah epidermis atas dengan jaringan epidermis. Sel pada lapisan pertama tampak rapat dan memiliki banyak kloroplas, sedangkan epidermis terutama melindungi daun. Jaringan apakah yang paling aktif melakukan fotosintesis?",
    e: "Jaringan parenkim, khususnya parenkim palisade, kaya kloroplas dan menjadi tempat utama fotosintesis pada daun.",
    opts: [
      ["Epidermis", false],
      ["Parenkim", true],
      ["Sklerenkim", false],
      ["Floem", false],
    ],
  },
  {
    q: "Seorang pekebun mengelupas kulit batang melingkar tanpa memotong bagian kayunya. Beberapa waktu kemudian, gula menumpuk di atas bagian yang dikelupas, tetapi air masih dapat bergerak dari akar ke daun. Jaringan apakah yang paling mungkin terputus?",
    e: "Floem mengangkut hasil fotosintesis dari daun ke bagian tumbuhan lain; pengelupasan kulit batang dapat memutus floem.",
    opts: [
      ["Xilem", false],
      ["Floem", true],
      ["Kambium", false],
      ["Korteks", false],
    ],
  },
  {
    q: "Gerakan makanan di usus tetap berlangsung tanpa harus diperintah secara sadar. Dinding usus berkontraksi bergelombang untuk mendorong makanan. Jenis jaringan otot apakah yang paling sesuai dengan ciri tersebut?",
    e: "Otot polos bekerja tidak sadar dan terdapat pada dinding organ dalam, termasuk saluran pencernaan.",
    opts: [
      ["Otot lurik", false],
      ["Otot polos", true],
      ["Otot jantung", false],
      ["Otot rangka", false],
    ],
  },
  {
    q: "Seorang siswa mengunyah roti tawar cukup lama sebelum menelannya. Roti mulai terasa manis meskipun tidak ditambahkan gula. Enzim apakah yang paling mungkin menyebabkan perubahan awal tersebut?",
    e: "Ptialin atau amilase saliva memecah amilum dalam roti menjadi gula yang lebih sederhana, termasuk maltosa.",
    opts: [
      ["Pepsin", false],
      ["Ptialin", true],
      ["Tripsin", false],
      ["Lipase", false],
    ],
  },
  {
    q: "Setelah makanan berprotein masuk ke saluran cerna, pemecahan kimiawi protein dimulai di organ yang menghasilkan asam dan enzim pepsin. Jika organ itu tidak bekerja normal, tahap awal pencernaan protein akan terganggu. Organ apakah yang dimaksud?",
    e: "Lambung menghasilkan HCl yang menciptakan suasana asam dan mengaktifkan pepsin untuk memulai pencernaan protein.",
    opts: [
      ["Mulut", false],
      ["Lambung", true],
      ["Usus besar", false],
      ["Kerongkongan", false],
    ],
  },
  {
    q: "Seorang pasien mengalami kerusakan pada tonjolan-tonjolan kecil di dinding usus yang biasanya memperluas bidang penyerapan. Ia kemudian kekurangan beberapa zat gizi meskipun makan cukup. Bagian saluran cerna manakah yang kemungkinan mengalami gangguan?",
    e: "Vili terdapat pada usus halus dan memperluas permukaan untuk menyerap sari-sari makanan.",
    opts: [
      ["Lambung", false],
      ["Usus halus", true],
      ["Usus besar", false],
      ["Rektum", false],
    ],
  },
  {
    q: "Pada paru-paru pasien, udara masih dapat melewati trakea dan bronkus, tetapi pertukaran gas dengan darah menurun karena permukaan kantung udaranya meradang. Bagian apakah yang paling langsung mengalami gangguan?",
    e: "Pertukaran oksigen dan karbon dioksida berlangsung melalui difusi pada alveolus yang berdekatan dengan kapiler.",
    opts: [
      ["Bronkus", false],
      ["Trakea", false],
      ["Alveolus", true],
      ["Laring", false],
    ],
  },
  {
    q: "Saat seorang siswa menarik napas dalam-dalam, rongga dadanya membesar dan udara masuk ke paru-paru. Perubahan tekanan tersebut terjadi setelah otot utama pada pernapasan perut berkontraksi. Otot apakah itu?",
    e: "Diafragma berkontraksi dan mendatar saat inspirasi pernapasan perut, memperbesar volume rongga dada.",
    opts: [
      ["Diafragma", true],
      ["Interkostal luar", false],
      ["Abdominal", false],
      ["Biseps", false],
    ],
  },
  {
    q: "Seorang siswa tiba-tiba mengi dan sulit mengembuskan napas setelah terpapar debu. Dokter menjelaskan bahwa saluran bronkus menyempit akibat respons terhadap pemicu alergi. Gangguan apakah yang paling sesuai?",
    e: "Asma ditandai penyempitan dan peradangan saluran napas yang dapat dipicu alergen, sehingga timbul mengi dan sesak.",
    opts: [
      ["TBC", false],
      ["Bronkitis", false],
      ["Asma", true],
      ["Pneumonia", false],
    ],
  },
  {
    q: "Hasil pemeriksaan menunjukkan bilik jantung yang memompa darah beroksigen ke seluruh tubuh mengalami kerusakan. Akibatnya, aliran darah menuju aorta dan jaringan tubuh menurun. Ruang jantung manakah yang terganggu?",
    e: "Ventrikel kiri memompa darah beroksigen ke aorta untuk diedarkan ke seluruh tubuh.",
    opts: [
      ["Atrium kanan", false],
      ["Ventrikel kanan", false],
      ["Atrium kiri", false],
      ["Ventrikel kiri", true],
    ],
  },
  {
    q: "Darah yang baru memperoleh oksigen di paru-paru harus kembali ke jantung sebelum dipompa ke seluruh tubuh. Jalur pembuluh manakah yang membawa darah tersebut menuju jantung?",
    e: "Vena pulmonalis membawa darah kaya oksigen dari paru-paru menuju atrium kiri.",
    opts: [
      ["Arteri pulmonalis", false],
      ["Vena pulmonalis", true],
      ["Vena cava", false],
      ["Aorta", false],
    ],
  },
  {
    q: "Seorang siswa tergores dan darahnya mula-mula mengalir, lalu membentuk bekuan yang menutup luka. Komponen darah apakah yang paling berperan memulai proses pembekuan tersebut?",
    e: "Trombosit berkumpul di area luka dan membantu memulai rangkaian koagulasi darah.",
    opts: [
      ["Eritrosit", false],
      ["Leukosit", false],
      ["Trombosit", true],
      ["Plasma", false],
    ],
  },
  {
    q: "Dalam simulasi transfusi sistem ABO sederhana, seorang pasien membutuhkan sel darah merah yang tidak membawa antigen A maupun antigen B agar risiko penggumpalan ABO dapat ditekan. Golongan apakah yang paling sesuai sebagai donor universal pada sistem ABO?",
    e: "Pada sistem ABO, eritrosit golongan O tidak memiliki antigen A atau B. Faktor rhesus tetap perlu diperhitungkan pada transfusi nyata.",
    opts: [
      ["AB", false],
      ["A", false],
      ["B", false],
      ["O", true],
    ],
  },
  {
    q: "Lebah memperoleh nektar dari bunga dan pada saat yang sama memindahkan serbuk sari ke bunga lain sehingga membantu reproduksi tumbuhan. Jika kedua organisme memperoleh manfaat, jenis interaksi apakah yang terjadi?",
    e: "Interaksi tersebut mutualisme karena lebah memperoleh nektar dan bunga terbantu proses penyerbukannya.",
    opts: [
      ["Mutualisme", true],
      ["Parasitisme", false],
      ["Komensalisme", false],
      ["Kompetisi", false],
    ],
  },
  {
    q: "Di suatu sawah, siswa mengamati belalang memakan tumbuhan, katak memangsa belalang, dan ular memangsa katak. Organisme manakah yang menjadi sumber energi awal bagi rantai makanan tersebut?",
    e: "Padi berfotosintesis dan berperan sebagai produsen, sehingga menjadi sumber energi awal bagi konsumen dalam rantai makanan.",
    opts: [
      ["Belalang", false],
      ["Padi", true],
      ["Katak", false],
      ["Ular", false],
    ],
  },
  {
    q: "Dalam pengamatan sawah, energi berasal dari padi, lalu berpindah ke belalang, katak, dan ular. Rangkaian manakah yang menunjukkan aliran energi tersebut secara benar?",
    e: "Energi mengalir dari produsen ke konsumen tingkat I, lalu ke konsumen tingkat lebih tinggi.",
    opts: [
      ["Elang → ayam → padi", false],
      ["Padi → belalang → katak → ular", true],
      ["Katak → belalang → padi", false],
      ["Ular → katak → belalang", false],
    ],
  },
  {
    q: "Siswa membandingkan sel tumbuhan dengan sel hewan. Sel tumbuhan dapat mempertahankan bentuk lebih kaku karena memiliki lapisan kuat di luar membran, sementara sel hewan tidak memilikinya. Zat apakah yang terutama menyusun lapisan tersebut?",
    e: "Dinding sel tumbuhan terutama tersusun atas selulosa, yang membantu melindungi dan mempertahankan bentuk sel.",
    opts: [
      ["Kitin", false],
      ["Selulosa", true],
      ["Peptidoglikan", false],
      ["Lignin saja", false],
    ],
  },
  {
    q: "Sel ragi diberi zat yang menghambat rantai transpor elektron. Setelah perlakuan, produksi ATP turun tajam meskipun pemecahan glukosa awal masih berlangsung. Tahap respirasi seluler manakah yang paling terdampak?",
    e: "Fosforilasi oksidatif pada rantai transpor elektron menghasilkan sebagian besar ATP respirasi aerob.",
    opts: [
      ["Glikolisis", false],
      ["Siklus Krebs", false],
      ["Fosforilasi oksidatif", true],
      ["Fermentasi", false],
    ],
  },
  {
    q: "Tanaman yang diletakkan dekat jendela tumbuh membengkok ke arah cahaya. Pertumbuhan tidak merata karena hormon tertentu menumpuk pada sisi yang lebih teduh dan memacu pemanjangan sel. Hormon apakah yang berperan?",
    e: "Auksin terakumulasi di sisi teduh batang dan merangsang pemanjangan sel sehingga batang membengkok ke arah cahaya.",
    opts: [
      ["Giberelin", false],
      ["Auksin", true],
      ["Sitokinin", false],
      ["Etilen", false],
    ],
  },
  {
    q: "Seorang siswa sering lemas dan hasil pemeriksaan menunjukkan kadar hemoglobin rendah. Karena hemoglobin berada di dalam sel darah yang mengangkut oksigen, komponen darah apakah yang paling berkaitan dengan gangguan tersebut?",
    e: "Eritrosit membawa hemoglobin yang mengikat oksigen; jumlah atau kualitasnya yang rendah dapat mengurangi pengangkutan oksigen.",
    opts: [
      ["Leukosit", false],
      ["Eritrosit", true],
      ["Trombosit", false],
      ["Fibrinogen", false],
    ],
  },
  {
    q: "Biji kacang kering mulai membengkak beberapa jam setelah disiram, bahkan sebelum akar kecil terlihat. Air masuk dan mengembangkan jaringan biji sebelum proses perkecambahan berlangsung. Proses apakah yang menjelaskan tahap awal ini?",
    e: "Imbibisi adalah penyerapan air oleh bahan koloid pada biji kering sehingga biji membengkak.",
    opts: [
      ["Imbibisi", true],
      ["Osmosis daun", false],
      ["Transpirasi", false],
      ["Gutasi", false],
    ],
  },
  {
    q: "Seekor hewan hidup di darat tetapi harus menjaga kulitnya tetap lembap. Hewan itu juga mengambil udara dengan paru-paru, terutama ketika sudah dewasa. Pasangan cara bernapas apakah yang paling sesuai?",
    e: "Katak dewasa dapat melakukan pertukaran gas melalui paru-paru dan kulit lembap.",
    opts: [
      ["Ikan", false],
      ["Katak", true],
      ["Belalang", false],
      ["Cacing saja", false],
    ],
  },
];

const POSTTEST: Q[] = [
  {
    q: "Seorang siswa mengamati epidermis bawang merah dan menemukan dinding sel, vakuola besar, serta nukleus. Bawang tumbuh di bawah tanah dan bagian epidermis yang diamati tidak berwarna hijau. Struktur apakah yang wajar tidak ditemukan pada sel tersebut?",
    e: "Kloroplas umumnya terdapat pada sel tumbuhan yang melakukan fotosintesis; epidermis umbi bawang yang tidak terkena cahaya tidak memiliki kloroplas yang berfungsi seperti pada daun.",
    opts: [
      ["Dinding sel", false],
      ["Vakuola besar", false],
      ["Kloroplas", true],
      ["Nukleus", false],
    ],
  },
  {
    q: "Sebuah sel dimasukkan ke larutan yang komposisinya berbeda dari cairan di dalam sel. Sesudah beberapa menit, keseimbangan air dan ion sel terganggu, tetapi inti sel belum membelah. Jika lapisan pembatas sel rusak, fungsi apakah yang paling langsung gagal?",
    e: "Membran sel mengatur keluar-masuknya air dan zat secara selektif; kerusakan membran mengganggu transport tersebut.",
    opts: [
      ["Fotosintesis", false],
      ["Transport selektif zat", true],
      ["Pembelahan nukleus", false],
      ["Sintesis DNA", false],
    ],
  },
  {
    q: "Daun tanaman pot tampak layu pada siang yang panas, tetapi kembali tegak pada sore hari setelah suhu turun. Tanahnya masih lembap dan batang tidak rusak. Perubahan fisiologis apakah yang paling masuk akal menjelaskan kondisi sementara ini?",
    e: "Pada siang panas, laju transpirasi dapat melebihi penyerapan air sehingga tekanan turgor turun; saat kehilangan air berkurang, turgor pulih.",
    opts: [
      ["Plasmolisis permanen", false],
      ["Tekanan turgor dan transpirasi", true],
      ["Fotosintesis berhenti", false],
      ["Respirasi anaerob", false],
    ],
  },
  {
    q: "Dalam percobaan, sebagian daun ditutup kertas gelap, sedangkan bagian lainnya mendapat cahaya. Setelah daun direbus dan ditetesi lugol, hanya bagian terang menjadi biru kehitaman. Kesimpulan apa yang paling didukung oleh hasil tersebut?",
    e: "Bagian yang tidak menerima cahaya tidak membentuk amilum melalui fotosintesis; percobaan menunjukkan cahaya diperlukan untuk proses tersebut.",
    opts: [
      ["Klorofil rusak", false],
      ["Tidak terjadi fotosintesis tanpa cahaya", true],
      ["Daun kekurangan air", false],
      ["Lugol kedaluwarsa", false],
    ],
  },
  {
    q: "Batang pohon dikupas melingkar hingga jaringan kulit dan pembuluh tertentu terputus, tetapi bagian kayu di tengah tetap utuh. Beberapa hari kemudian, karbohidrat menumpuk di atas sayatan sementara air masih dapat mencapai daun. Pernyataan manakah yang paling tepat menjelaskan hasil ini?",
    e: "Xilem mengangkut air, sedangkan floem mengangkut hasil fotosintesis; pengupasan kulit terutama memutus floem.",
    opts: [
      ["Keduanya mengangkut air", false],
      ["Xilem air ke atas; floem hasil fotosintesis dua arah", true],
      ["Floem mati; xilem hidup", false],
      ["Tidak ada perbedaan", false],
    ],
  },
  {
    q: "Hasil pemeriksaan seorang pasien menunjukkan jumlah hemoglobin rendah dan ia cepat lelah saat beraktivitas. Pola makan pasien juga jarang mengandung sumber zat besi. Gangguan apakah yang paling mungkin terjadi, dan mengapa?",
    e: "Kekurangan zat besi dapat menghambat pembentukan hemoglobin sehingga kemampuan darah mengangkut oksigen menurun dan terjadi anemia.",
    opts: [
      ["Diabetes", false],
      ["Anemia", true],
      ["Hipertensi", false],
      ["Osteoporosis", false],
    ],
  },
  {
    q: "Empat sampel makanan diuji dengan reagen berbeda. Sampel X berubah menjadi ungu setelah ditetesi biuret, sedangkan sampel lain menunjukkan warna berbeda. Molekul gizi apakah yang dapat disimpulkan terdapat pada sampel X?",
    e: "Reagen biuret menghasilkan warna ungu ketika berikatan dengan ikatan peptida pada protein.",
    opts: [
      ["Amilum", false],
      ["Protein", true],
      ["Lemak", false],
      ["Glukosa", false],
    ],
  },
  {
    q: "Seorang pasien mengalami kerusakan pada vili usus halus. Walaupun makanan telah dicerna menjadi molekul sederhana, berat badannya turun dan beberapa zat gizi tetap kurang dalam darah. Hubungan sebab-akibat manakah yang paling tepat?",
    e: "Kerusakan vili memperkecil luas permukaan usus halus sehingga penyerapan nutrisi ke dalam darah berkurang.",
    opts: [
      ["Penyerapan nutrisi menurun", true],
      ["Produksi HCl meningkat", false],
      ["Gerak peristaltik berhenti total", false],
      ["Tidak ada dampak", false],
    ],
  },
  {
    q: "Seseorang menjalani operasi pengangkatan kantung empedu. Dokter menyarankan ia membatasi makanan berlemak dalam porsi besar, meskipun pankreasnya masih menghasilkan enzim pencernaan. Kombinasi apakah yang biasanya membantu pencernaan lemak dan dapat menjadi kurang efektif setelah perubahan tersebut?",
    e: "Lipase memecah lemak, sedangkan garam empedu membantu mengemulsikannya agar bidang kerja enzim lebih luas.",
    opts: [
      ["Amilase dan pepsin", false],
      ["Lipase dan garam empedu", true],
      ["HCl saja", false],
      ["Sekretin saja", false],
    ],
  },
  {
    q: "Seorang siswa berlari menaiki tangga. Ototnya menggunakan lebih banyak energi dan menghasilkan lebih banyak karbon dioksida daripada saat beristirahat, lalu napasnya menjadi lebih cepat. Perubahan apa yang paling langsung mendorong respons tersebut?",
    e: "Aktivitas meningkatkan kebutuhan oksigen dan produksi karbon dioksida; perubahan gas darah dideteksi tubuh dan meningkatkan ventilasi.",
    opts: [
      ["Otot lelah", false],
      ["Kebutuhan O2 dan kadar CO2 darah meningkat", true],
      ["Jantung berhenti", false],
      ["Alveolus menyempit", false],
    ],
  },
  {
    q: "Pada pemeriksaan kapasitas paru, seseorang mengembuskan napas sekuat mungkin setelah menarik napas sedalam-dalamnya. Alat spirometri tetap tidak dapat mengukur seluruh udara yang tertinggal di paru-paru. Istilah apakah untuk udara yang tidak dapat dikeluarkan secara maksimal itu?",
    e: "Udara residu adalah udara yang tetap berada di paru-paru setelah ekspirasi maksimal dan tidak dapat dikeluarkan secara sadar.",
    opts: [
      ["Tidal", false],
      ["Komplementer", false],
      ["Udara residu", true],
      ["Kapasitas vital", false],
    ],
  },
  {
    q: "Seorang perokok lama mengalami sesak saat berjalan. Pemeriksaan menunjukkan dinding alveolus rusak dan beberapa kantung udara menyatu sehingga permukaan untuk difusi gas berkurang. Kelainan apakah yang paling sesuai dengan kerusakan tersebut?",
    e: "Emfisema merusak dinding alveolus dan mengurangi luas permukaan pertukaran gas.",
    opts: [
      ["Alveolus menebal dan luas difusi menurun", true],
      ["Trakea menyempit permanen", false],
      ["Hemoglobin meningkat", false],
      ["Diafragma menguat", false],
    ],
  },
  {
    q: "Dalam pemeriksaan berulang, tekanan darah seseorang tercatat 150/95 mmHg. Nilai tersebut lebih tinggi daripada kisaran normal dan dapat meningkatkan beban kerja jantung bila berlangsung lama. Kondisi apakah yang paling tepat disimpulkan?",
    e: "Tekanan darah 150/95 mmHg termasuk hipertensi karena berada di atas nilai normal dan ambang diagnostik yang digunakan pada materi ini.",
    opts: [
      ["Hipotensi", false],
      ["Normal", false],
      ["Hipertensi", true],
      ["Anemia", false],
    ],
  },
  {
    q: "Katup antara atrium kiri dan ventrikel kiri pasien tidak menutup rapat saat ventrikel berkontraksi. Akibatnya, sebagian darah bergerak kembali dan volume yang menuju aorta berkurang. Arah aliran balik manakah yang terjadi?",
    e: "Katup bikuspidalis mencegah aliran balik; jika bocor, darah mengalir dari ventrikel kiri kembali ke atrium kiri.",
    opts: [
      ["Darah balik ventrikel kiri → atrium kiri", true],
      ["Darah tidak ke aorta sama sekali", false],
      ["O2 tidak diikat", false],
      ["Jantung berhenti", false],
    ],
  },
  {
    q: "Sebelum transfusi, petugas mencocokkan golongan darah ABO. Seorang pasien bergolongan A tidak memiliki antibodi anti-A, tetapi memiliki antibodi anti-B. Dari pilihan berikut, pasangan donor sel darah merah manakah yang aman menurut sistem ABO sederhana?",
    e: "Penerima bergolongan A dapat menerima sel darah merah A atau O pada sistem ABO; pemeriksaan rhesus dan uji silang tetap diperlukan dalam praktik.",
    opts: [
      ["B dan AB", false],
      ["A dan O", true],
      ["B dan O", false],
      ["AB saja", false],
    ],
  },
  {
    q: "Saat berolahraga, denyut jantung meningkat tanpa keputusan sadar. Pusat pengaturan tubuh menerima informasi tentang kebutuhan jaringan dan mengirim sinyal untuk menyesuaikan kerja jantung. Struktur dan jalur saraf apakah yang paling berkaitan dengan respons cepat tersebut?",
    e: "Medula oblongata mengatur fungsi otonom, dan saraf simpatis dapat meningkatkan frekuensi serta kekuatan denyut jantung.",
    opts: [
      ["Serebrum sadar", false],
      ["Medula oblongata dan saraf simpatis", true],
      ["Sumsum tulang", false],
      ["Hormon insulin", false],
    ],
  },
  {
    q: "Insektisida digunakan di sekitar kolam untuk mengendalikan hama. Beberapa waktu kemudian, residunya terdeteksi pada plankton dan kadarnya lebih tinggi pada ikan pemangsa yang berada di tingkat trofik atas. Proses apakah yang paling tepat menjelaskan pola itu?",
    e: "Biomagnifikasi menyebabkan konsentrasi zat pencemar persisten meningkat pada organisme di tingkat trofik yang lebih tinggi.",
    opts: [
      ["Ikan bermigrasi", false],
      ["Biomagnifikasi pestisida melalui rantai makanan", true],
      ["Fotosintesis meningkat", false],
      ["Oksigen meningkat", false],
    ],
  },
  {
    q: "Sebuah ekosistem memiliki produsen dengan energi 10.000 kJ. Jika hanya sebagian kecil energi diteruskan ke setiap tingkat konsumen, mengapa predator puncak biasanya memiliki energi tersedia jauh lebih sedikit?",
    e: "Sebagian besar energi digunakan dalam metabolisme atau terlepas sebagai panas; rata-rata hanya sebagian kecil (sekitar 10% pada model sederhana) diteruskan ke tingkat trofik berikutnya.",
    opts: [
      ["Produsen sedikit", false],
      ["Hanya ~10% energi diteruskan tiap trofik", true],
      ["Konsumen tidak bernapas", false],
      ["Dekomposer menambah energi", false],
    ],
  },
  {
    q: "Warga menanam kembali bakau di pantai yang mengalami abrasi dan kehilangan tempat hidup ikan kecil. Setelah beberapa tahun, garis pantai lebih terlindungi dan biota mulai kembali. Dua fungsi ekologis apakah yang paling sesuai dengan hasil tersebut?",
    e: "Akar mangrove membantu meredam gelombang dan menahan sedimen sehingga mengurangi abrasi; ekosistemnya juga menjadi habitat dan tempat asuhan biota.",
    opts: [
      ["Mencegah abrasi dan menyediakan habitat", true],
      ["Mengurangi oksigen", false],
      ["Menambah polusi", false],
      ["Mengusir ikan", false],
    ],
  },
  {
    q: "Pada pohon mangga ditemukan benalu yang mengambil air dan mineral dari jaringan inangnya. Benalu tumbuh subur, sedangkan cabang pohon yang ditempeli menunjukkan pertumbuhan terganggu. Bagaimana interaksi kedua organisme tersebut diklasifikasikan?",
    e: "Benalu memperoleh keuntungan dengan mengambil sumber daya, sementara pohon inang dirugikan; hubungan ini merupakan parasitisme.",
    opts: [
      ["Mutualisme", false],
      ["Komensalisme", false],
      ["Parasitisme", true],
      ["Netralisme", false],
    ],
  },
  {
    q: "Tape ketan yang baru dibuat terasa manis, lalu menjadi lebih asam setelah disimpan lebih lama. Perubahan rasa itu terjadi karena mikroorganisme mengubah karbohidrat secara bertahap. Urutan proses manakah yang paling mendekati penjelasan tersebut?",
    e: "Enzim mikroorganisme memecah amilum menjadi gula sederhana; fermentasi menghasilkan alkohol dan proses lanjutan dapat membentuk senyawa asam.",
    opts: [
      ["Amilum → glukosa → alkohol → asam", true],
      ["Protein → lemak", false],
      ["Fotosintesis ragi", false],
      ["Respirasi aerob penuh", false],
    ],
  },
  {
    q: "Jantung berkontraksi terus-menerus sepanjang hidup, sedangkan otot rangka dapat terasa lelah setelah aktivitas berat. Sel otot jantung memiliki banyak mitokondria dan pasokan oksigen yang baik. Penjelasan apakah yang paling sesuai dengan perbedaan tersebut?",
    e: "Banyak mitokondria mendukung respirasi aerob dan penyediaan ATP berkelanjutan yang dibutuhkan otot jantung untuk bekerja terus-menerus.",
    opts: [
      ["Otot jantung kaya mitokondria untuk metabolisme aerob", true],
      ["Otot lurik tidak punya aktin", false],
      ["Otot jantung tidak berkontraksi", false],
      ["Otot lurik tidak butuh ATP", false],
    ],
  },
  {
    q: "Pada daun dengan bercak hijau dan putih, siswa menutup daun dari cahaya lalu mengujinya dengan lugol. Setelah perlakuan, bagian hijau menjadi biru kehitaman sedangkan bagian putih tidak. Kesimpulan manakah yang paling kuat dari perbandingan tersebut?",
    e: "Bagian hijau mengandung klorofil dan dapat berfotosintesis membentuk amilum; bagian putih tidak menunjukkan hasil yang sama.",
    opts: [
      ["Fotosintesis butuh klorofil", true],
      ["Lugol hanya untuk protein", false],
      ["Daun putih lebih aktif", false],
      ["Cahaya merusak daun", false],
    ],
  },
  {
    q: "Peneliti ingin mengetahui apakah serangga yang mengunjungi bunga benar-benar memiliki hubungan mutualisme, bukan sekadar hinggap. Data apa yang sebaiknya dibandingkan untuk menguji manfaat bagi kedua pihak?",
    e: "Mutualisme ditandai kedua organisme memperoleh manfaat, misalnya keberhasilan reproduksi bunga meningkat dan serangga memperoleh sumber makanan.",
    opts: [
      ["Keduanya mendapat manfaat", true],
      ["Serangga hinggap sekali", false],
      ["Bunga berwarna cerah", false],
      ["Serangga memakan daun", false],
    ],
  },
  {
    q: "Dalam percobaan tanaman air, sensor menunjukkan konsentrasi CO2 di air menurun setelah lampu dinyalakan, sedangkan kontrol yang gelap tidak menunjukkan penurunan serupa. Jika faktor lain dijaga tetap, proses apakah yang paling mungkin menyebabkan perubahan itu?",
    e: "Pada kondisi bercahaya, fotosintesis menggunakan CO2; penurunan terukur menunjukkan penyerapan CO2 oleh fotosintesis lebih besar daripada pelepasannya pada kondisi percobaan.",
    opts: [
      ["Fotosintesis menyerap CO2", true],
      ["Respirasi berhenti total", false],
      ["Tanaman mati", false],
      ["Lampu menambah CO2", false],
    ],
  },
];

const PRETEST_STORY_CONTEXT = [
  "Pengujian diulang pada beberapa daun dan pola hasilnya tetap sama.",
  "Pengamatan dilakukan dengan membandingkan kebutuhan energi sel saat istirahat dan saat bekerja intensif.",
  "Siswa juga mencatat perubahan bentuk sel sebelum dan sesudah perlakuan.",
  "Guru meminta siswa menghubungkan letak jaringan, ciri sel, dan tugasnya.",
  "Pekebun ingin mengetahui jalur yang tetap berfungsi setelah kulit batang dilepas.",
  "Kontraksi tersebut terjadi berulang meskipun orang itu sedang tidur.",
  "Perubahan rasa muncul ketika makanan bercampur dengan air liur di dalam mulut.",
  "Makanan kemudian bergerak ke usus halus untuk melanjutkan proses pencernaan.",
  "Dokter mengaitkan gejala itu dengan berkurangnya luas permukaan penyerapan.",
  "Kondisi tersebut membuat kadar oksigen darah pasien lebih rendah dari biasanya.",
  "Perubahan gerak otot itu terjadi otomatis selama proses inspirasi.",
  "Keluhan berkurang setelah pasien menjauhi pemicu dan menggunakan obat sesuai anjuran dokter.",
  "Ruang jantung lain masih terisi, tetapi tekanan pompa ke tubuh melemah.",
  "Dinding pembuluh tersebut tetap membawa darah meskipun namanya tidak menunjukkan kadar oksigen.",
  "Proses ini membantu tubuh membatasi kehilangan darah sebelum jaringan pulih.",
  "Pada simulasi ini, faktor rhesus diabaikan sehingga penilaian dibatasi pada antigen ABO.",
  "Jumlah bunga yang berhasil membentuk biji meningkat ketika lebah sering berkunjung.",
  "Siswa menelusuri asal energi sebelum energi berpindah ke hewan pemakan tumbuhan.",
  "Setiap panah pada diagram menunjukkan perpindahan energi dari organisme yang dimakan ke pemakannya.",
  "Sampel diperiksa menggunakan mikroskop untuk membandingkan batas luar kedua jenis sel.",
  "Sel masih mampu memulai pemecahan glukosa, tetapi produksi energi total menurun.",
  "Batang yang berada di tempat teduh memanjang lebih cepat daripada sisi yang terkena cahaya.",
  "Sel darah tersebut mengikat oksigen sebelum mengantarkannya ke berbagai jaringan tubuh.",
  "Biji yang disiram menyerap air lebih dahulu, sedangkan biji kering tetap keras.",
  "Ciri pernapasan berubah dari tahap muda menuju tahap dewasa pada hewan tersebut.",
];

const POSTTEST_STORY_CONTEXT = [
  "Pengamatan dilakukan pada sel penyimpan yang tidak menerima cahaya selama pertumbuhannya.",
  "Sel masih memiliki inti dan organel lain, tetapi kestabilan kondisi internalnya berubah.",
  "Tanaman pulih tanpa tambahan air, sehingga siswa membandingkan laju kehilangan airnya.",
  "Kedua bagian berasal dari daun yang sama dan menerima perlakuan lugol yang sama.",
  "Hasil pengukuran dilakukan sebelum dan sesudah pengupasan pada cabang yang sama.",
  "Pemeriksaan lanjutan menunjukkan jumlah sel darah merah dan kemampuan mengikat oksigennya menurun.",
  "Siswa menggunakan kontrol positif dan negatif untuk memastikan perubahan warna dapat dipercaya.",
  "Pencernaan di lambung dan pemecahan kimiawi sudah berlangsung, tetapi tubuh tetap kekurangan nutrisi.",
  "Pengemulsian mengubah lemak menjadi butiran kecil, tetapi tidak memutus molekul lemak itu sendiri.",
  "Perubahan napas terjadi beberapa saat setelah aktivitas dimulai dan mereda setelah beristirahat.",
  "Pengukuran spirometri mencatat udara yang keluar, bukan udara yang tetap tertahan.",
  "Pasien juga mengalami kesulitan mengeluarkan udara karena elastisitas paru-parunya menurun.",
  "Dokter meminta pengukuran diulang dalam kondisi istirahat sebelum membuat kesimpulan klinis.",
  "Pemeriksaan menunjukkan katup masih dapat terbuka, tetapi penutupan saat sistol tidak sempurna.",
  "Petugas tetap melakukan uji silang karena kecocokan ABO saja belum mencakup semua faktor transfusi.",
  "Respons muncul cepat tanpa kendali sadar dan diikuti perubahan frekuensi denyut jantung.",
  "Konsentrasi zat meningkat pada organisme pemangsa walaupun paparan awal terjadi di air.",
  "Produsen menyimpan energi paling besar, sedangkan setiap perpindahan melepaskan sebagian energi sebagai panas.",
  "Warga membandingkan keadaan pantai dan jumlah ikan kecil sebelum serta sesudah penanaman.",
  "Benalu mendapat sumber daya dari inang, sedangkan kerugian terlihat pada pertumbuhan cabang.",
  "Fermentasi berlangsung tanpa oksigen bebas dan melibatkan aktivitas mikroorganisme.",
  "Jantung bekerja terus-menerus dan harus menghasilkan energi meskipun tubuh sedang beristirahat.",
  "Bagian hijau dan putih dibandingkan pada daun yang sama agar kondisi lain tetap sebanding.",
  "Peneliti mencatat jumlah kunjungan, ketersediaan nektar, dan keberhasilan pembentukan biji.",
  "Penggunaan sensor dan wadah kontrol membantu memisahkan pengaruh cahaya dari perubahan alami air.",
];

function addStoryContext(question: string, context: string) {
  const questionMark = question.lastIndexOf("?");
  const sentenceBreak = question.lastIndexOf(".", questionMark);
  if (questionMark < 0 || sentenceBreak < 0) return `${context} ${question}`;
  return `${question.slice(0, sentenceBreak + 1)} ${context} ${question.slice(sentenceBreak + 1, questionMark).trim()}?`;
}

PRETEST.forEach((item, index) => { item.q = addStoryContext(item.q, PRETEST_STORY_CONTEXT[index]); });
POSTTEST.forEach((item, index) => { item.q = addStoryContext(item.q, POSTTEST_STORY_CONTEXT[index]); });

const MATERIALS = [
  {
    order: 1,
    title: "Sel dan Struktur Sel",
    slug: "sel-dan-struktur-sel",
    description:
      "Mengkaji sel sebagai unit kehidupan, hubungan struktur organel dengan fungsi, serta cara membran mengatur pertukaran zat.",
    objectives:
      "1. Menjelaskan sel sebagai unit struktural dan fungsional kehidupan.\n2. Menghubungkan struktur organel dengan fungsi dan alur kerja di dalam sel.\n3. Membandingkan sel prokariotik dan eukariotik serta sel hewan dan tumbuhan.\n4. Menganalisis perpindahan zat melalui membran berdasarkan gradien konsentrasi.",
    content: `# Sel dan Struktur Sel\n\n## Gambaran umum\n\nSel merupakan unit terkecil kehidupan yang mampu menjalankan proses dasar seperti memperoleh energi, menjaga kondisi internal, merespons rangsangan, dan menghasilkan keturunan. Ukurannya kecil, tetapi di dalamnya terdapat sistem yang saling bekerja sama. Bentuk sel juga beragam karena menyesuaikan tugasnya: sel saraf memanjang untuk menghantarkan impuls, sedangkan sel darah merah berbentuk pipih untuk membantu pertukaran gas.\n\nTeori sel modern berangkat dari tiga gagasan utama: semua makhluk hidup tersusun atas satu atau lebih sel, sel merupakan unit dasar struktur dan fungsi kehidupan, dan sel baru berasal dari sel yang telah ada. Virus tidak tersusun atas sel dan hanya dapat memperbanyak diri dengan memanfaatkan sel inang, sehingga tidak digolongkan sebagai organisme seluler.\n\n## Prokariotik dan eukariotik\n\n- **Prokariotik**, seperti bakteri, tidak memiliki inti bermembran. Materi genetiknya berada di daerah nukleoid; sel tetap memiliki membran, sitoplasma, ribosom, dan umumnya dinding sel.\n- **Eukariotik**, seperti sel hewan, tumbuhan, jamur, dan protista, memiliki inti bermembran serta organel yang terspesialisasi. Pembagian ruang ini membantu reaksi yang berbeda berlangsung secara teratur.\n\n## Membran sel dan transport zat\n\nMembran tersusun terutama atas dua lapis fosfolipid dengan protein yang tertanam di dalamnya. Bagian kepala fosfolipid berinteraksi dengan air, sementara ekornya menghindari air. Susunan ini membentuk batas yang lentur dan **selektif permeabel**: beberapa zat dapat lewat, sedangkan zat lain perlu bantuan protein atau energi.\n\n- **Difusi** adalah perpindahan partikel dari daerah berkonsentrasi tinggi ke rendah sampai lebih merata. Oksigen, misalnya, berdifusi dari alveolus ke darah karena konsentrasinya lebih tinggi di alveolus.\n- **Osmosis** adalah perpindahan air melalui membran selektif dari larutan yang lebih encer menuju larutan yang lebih pekat. Sel tumbuhan yang kehilangan banyak air menjadi layu; masuknya air dapat membuat sel kembali tegang karena vakuola menekan dinding sel.\n- **Transpor aktif** memindahkan zat melawan gradien konsentrasi dan memerlukan energi ATP serta protein pembawa. Pompa natrium-kalium pada membran sel hewan adalah salah satu contohnya.\n- Molekul besar dapat dipindahkan melalui **endositosis** (masuk) dan **eksositosis** (keluar), ketika membran membentuk atau menyatukan vesikel.\n\n## Organel dan kerja sama di dalam sel\n\n- **Nukleus** menyimpan sebagian besar DNA dan mengatur aktivitas sel melalui ekspresi gen. Nukleolus di dalamnya berperan dalam pembentukan komponen ribosom.\n- **Ribosom** merangkai asam amino menjadi protein. Ribosom bebas umumnya membuat protein yang digunakan di sitoplasma; ribosom pada RE kasar banyak membuat protein membran atau protein yang akan disekresikan.\n- **Retikulum endoplasma kasar** membantu pemrosesan awal protein. **RE halus** berperan dalam sintesis lipid, metabolisme zat tertentu, dan penyimpanan ion kalsium pada beberapa sel.\n- **Badan Golgi** memodifikasi, menyortir, dan mengemas protein atau lipid ke dalam vesikel untuk dikirim ke lokasi yang tepat.\n- **Mitokondria** menjadi tempat utama respirasi aerob yang menghasilkan ATP. Sel yang membutuhkan banyak energi, misalnya sel otot, biasanya memiliki banyak mitokondria.\n- **Lisosom** berisi enzim untuk menguraikan bahan yang masuk dan bagian sel yang sudah tidak berfungsi.\n- **Kloroplas** pada tumbuhan dan alga menangkap energi cahaya untuk fotosintesis. **Vakuola sentral** tumbuhan menyimpan air dan zat terlarut serta membantu mempertahankan tekanan turgor. **Dinding sel** dari selulosa memberi perlindungan dan bentuk, tetapi tidak menggantikan fungsi membran dalam mengatur lalu lintas zat.\n\nAlur sebuah protein yang akan dikeluarkan sel menggambarkan kerja sama organel: informasi gen dibaca di nukleus, protein dirakit oleh ribosom pada RE kasar, dibawa dalam vesikel ke badan Golgi untuk diproses dan dikemas, lalu dilepas melalui eksositosis.\n\n## Perbandingan sel hewan dan tumbuhan\n\nKeduanya sama-sama eukariotik serta mempunyai membran, nukleus, mitokondria, RE, badan Golgi, dan ribosom. Sel tumbuhan umumnya memiliki dinding sel, kloroplas pada jaringan fotosintetik, serta vakuola sentral besar. Sel hewan tidak memiliki dinding sel dan kloroplas; bentuknya lebih fleksibel dan banyak selnya memiliki sentrosom dengan sentriol. Tidak semua sel tumbuhan memiliki kloroplas—sel akar yang berada di dalam tanah, misalnya, biasanya tidak berfotosintesis.\n\n## Penerapan dan rangkuman\n\nJika sel darah merah ditempatkan dalam larutan yang sangat pekat, air keluar melalui osmosis dan sel mengerut. Jika sel tumbuhan kekurangan air, vakuola menyusut dan tekanan turgor turun sehingga tanaman layu. Kedua peristiwa ini menunjukkan bahwa kondisi larutan di sekitar sel memengaruhi perpindahan air melalui membran.\n\nIntinya, fungsi sel muncul dari koordinasi banyak bagian: membran mengatur pertukaran, DNA menyimpan instruksi, ribosom membuat protein, organel memproses dan mengirim bahan, sedangkan mitokondria memasok energi. Struktur dan fungsi selalu saling berkaitan.`,
    videoTitle: "Sel dan Organel Sel - Biologi SMA",
    videoUrl: "https://www.youtube.com/watch?v=URUJD5NEXC8",
  },
  {
    order: 2,
    title: "Jaringan pada Tumbuhan dan Hewan",
    slug: "jaringan-tumbuhan-hewan",
    description:
      "Membandingkan jaringan tumbuhan dan hewan, cara sel terspesialisasi, serta hubungan susunan jaringan dengan fungsi organ.",
    objectives:
      "1. Mengelompokkan jaringan tumbuhan berdasarkan asal, letak, dan fungsinya.\n2. Menjelaskan jenis jaringan hewan dan ciri strukturnya.\n3. Menganalisis hubungan spesialisasi sel, jaringan, dan kerja organ.",
    content: `# Jaringan pada Tumbuhan dan Hewan\n\n## Dari sel menjadi jaringan\n\nPada organisme multiseluler, sel dengan bentuk dan fungsi yang serupa bekerja bersama membentuk jaringan. Beberapa jaringan kemudian menyusun organ, dan organ bekerja dalam sistem organ. Spesialisasi membuat tugas lebih efisien, tetapi juga menciptakan ketergantungan: jaringan pengangkut tumbuhan memerlukan jaringan pelindung dan jaringan fotosintetik, sementara organ hewan memerlukan kombinasi epitel, ikat, otot, dan saraf.\n\n## Jaringan tumbuhan\n\n- **Meristem** tersusun dari sel muda yang aktif membelah. Meristem apikal di ujung akar dan batang menambah panjang tumbuhan (pertumbuhan primer). Meristem lateral, termasuk kambium vaskular, menambah diameter batang atau akar (pertumbuhan sekunder). Meristem interkalar terdapat di pangkal ruas pada beberapa tumbuhan, misalnya rumput.\n- **Epidermis** menutup permukaan organ muda dan mengurangi kehilangan air. Pada daun, stomata yang dibentuk oleh dua sel penjaga mengatur pertukaran gas dan transpirasi. Rambut akar memperluas bidang penyerapan, sedangkan trikoma dapat membantu melindungi permukaan.\n- **Parenkim** merupakan jaringan dasar dengan fungsi beragam. Parenkim palisade pada daun kaya kloroplas untuk fotosintesis; parenkim spons memiliki ruang antarsel untuk pertukaran gas; parenkim lain dapat menyimpan pati, air, atau udara.\n- **Kolenkim** menopang organ muda yang masih tumbuh dengan dinding sel menebal tidak merata. **Sklerenkim** memberi dukungan kuat pada bagian dewasa karena dindingnya tebal dan berlignin; banyak selnya telah mati saat berfungsi.\n- **Xilem** mengangkut air dan mineral dari akar ke bagian atas tumbuhan serta membantu menyokong tubuh. Unsur pembuluh dan trakeid yang dewasa umumnya mati dan membentuk saluran berongga. Tarikan transpirasi dari daun, kohesi antarmolekul air, dan adhesi pada dinding berkontribusi pada pergerakan air.\n- **Floem** mendistribusikan hasil fotosintesis dari organ sumber, seperti daun dewasa, menuju organ pemakai atau penyimpan, seperti akar, buah, dan tunas. Arah aliran pada satu tabung tapis mengikuti hubungan sumber–tujuan; karena sumber dan tujuan dapat berbeda, aliran pada jaringan floem suatu tumbuhan dapat berlangsung ke arah berbeda.\n\n## Jaringan hewan\n\n- **Epitel** melapisi permukaan tubuh, rongga, dan organ. Sel epitel tersusun rapat dengan sedikit ruang antarsel. Epitel pipih tipis memudahkan difusi, seperti pada alveolus; epitel silindris pada usus dapat memiliki mikrovili untuk memperluas penyerapan. Epitel berlapis cocok untuk perlindungan, seperti pada kulit.\n- **Jaringan ikat** menghubungkan, menyokong, melindungi, atau mengisi ruang. Matriks ekstraselulernya bervariasi: darah memiliki matriks cair, tulang bermineral keras, tulang rawan lentur, dan jaringan lemak menyimpan energi sekaligus membantu isolasi.\n- **Jaringan otot** menghasilkan gerakan melalui kontraksi. Otot rangka/lurik umumnya bekerja secara sadar untuk menggerakkan tulang. Otot polos bekerja tanpa disadari pada dinding organ dalam. Otot jantung berkontraksi ritmis tanpa disadari dan hanya terdapat pada jantung.\n- **Jaringan saraf** menerima, mengolah, dan menghantarkan informasi. Neuron memiliki dendrit untuk menerima sinyal, badan sel yang mengandung inti, dan akson untuk meneruskan impuls. Sel glia membantu melindungi, memberi nutrisi, dan menjaga lingkungan neuron.\n\n## Hubungan struktur dan fungsi\n\nVili dan mikrovili pada usus halus memperbesar luas permukaan penyerapan; dindingnya memiliki epitel tipis dan banyak kapiler untuk membawa nutrisi. Pada daun, susunan sel palisade dekat permukaan atas membantu menangkap cahaya, sementara stomata dan ruang udara mendukung pertukaran gas. Pada batang berkayu, xilem yang berlignin memberi kekuatan sekaligus mengangkut air. Contoh-contoh ini menunjukkan bahwa fungsi organ bergantung pada susunan jaringan, bukan satu jenis sel saja.\n\n## Rangkuman\n\nJaringan tumbuhan mencakup meristem, pelindung, dasar, penyokong, dan pengangkut. Jaringan utama hewan adalah epitel, ikat, otot, dan saraf. Untuk memahami fungsi sebuah organ, perhatikan jenis sel penyusunnya, bentuk atau bahan matriksnya, letaknya, dan bagaimana jaringan itu bekerja bersama jaringan lain.`,
    videoTitle: "Jaringan Tumbuhan dan Hewan - Biologi SMA",
    videoUrl: "https://www.youtube.com/watch?v=8IlzKri08kk",
  },
  {
    order: 3,
    title: "Sistem Pencernaan Manusia",
    slug: "sistem-pencernaan-manusia",
    description:
      "Menelusuri perjalanan makanan, peran enzim dan organ aksesori, penyerapan zat gizi, serta kaitannya dengan kesehatan.",
    objectives:
      "1. Menjelaskan urutan organ saluran pencernaan dan peran organ aksesori.\n2. Menganalisis pencernaan mekanis dan kimiawi zat makanan.\n3. Menjelaskan penyerapan serta pengangkutan hasil pencernaan.\n4. Menghubungkan kebiasaan makan dan gejala gangguan dengan fungsi sistem pencernaan.",
    content: `# Sistem Pencernaan Manusia\n\n## Tujuan pencernaan\n\nMakanan mengandung molekul yang umumnya terlalu besar untuk langsung diserap. Sistem pencernaan memecahnya menjadi molekul kecil, memindahkannya melewati dinding usus ke darah atau limfa, lalu membuang sisa yang tidak tercerna. Pencernaan mekanis mengubah ukuran dan mencampur makanan; pencernaan kimiawi memutus ikatan molekul dengan bantuan enzim.\n\n## Perjalanan makanan\n\n**Mulut → faring → esofagus → lambung → usus halus (duodenum, jejunum, ileum) → usus besar → rektum → anus.** Gerak peristaltik, yaitu kontraksi bergelombang otot polos, mendorong makanan di sepanjang saluran. Epiglotis membantu menutup jalan napas saat menelan sehingga makanan diarahkan ke esofagus.\n\n- **Mulut:** gigi memotong dan menghaluskan makanan. Lidah mencampur makanan dengan saliva dan membentuk bolus untuk ditelan. Amilase saliva mulai memecah pati menjadi gula yang lebih sederhana, terutama maltosa dan dekstrin.\n- **Esofagus:** bolus didorong oleh peristaltik; tidak terjadi penyerapan zat gizi dalam jumlah berarti di sini.\n- **Lambung:** otot lambung mengaduk makanan dengan getah lambung hingga terbentuk kimus. Asam klorida menciptakan suasana asam, membantu mengaktifkan pepsin, dan menghambat banyak mikroorganisme yang tertelan. Pepsin memecah protein menjadi rantai peptida yang lebih pendek. Mukus melindungi dinding lambung dari asam dan enzimnya sendiri.\n- **Usus halus:** bagian duodenum menerima kimus, empedu dari hati/kantung empedu, serta getah pankreas. Bikarbonat dari pankreas membantu menetralkan keasaman kimus. Enzim pankreas melanjutkan pemecahan karbohidrat, protein, dan lemak; enzim pada permukaan usus menyelesaikan pencernaan menjadi molekul yang dapat diserap. Jejunum dan ileum menjadi tempat utama penyerapan zat gizi.\n- **Usus besar:** menyerap kembali air dan elektrolit, menjadi tempat aktivitas mikrobiota, lalu membentuk feses. Rektum menyimpan feses sementara sebelum dikeluarkan melalui anus.\n\n## Organ aksesori dan enzim\n\nPankreas menghasilkan amilase untuk pati, lipase untuk trigliserida, serta protease seperti tripsin dan kimotripsin untuk protein. Protease dilepas dalam bentuk tidak aktif dan diaktifkan di usus agar tidak mencerna jaringan pankreas. Hati menghasilkan **empedu**, yang disimpan dan dipekatkan di kantung empedu. Empedu bukan enzim: garam empedu memecah gumpalan lemak menjadi tetesan kecil (emulsifikasi), sehingga luas permukaan lemak bertambah dan lipase lebih mudah bekerja.\n\nHasil akhir pencernaan karbohidrat adalah monosakarida seperti glukosa; protein menjadi asam amino; lemak menjadi asam lemak dan monogliserida. Disakarida seperti maltosa, sukrosa, dan laktosa diuraikan oleh maltase, sukrase, dan laktase pada permukaan usus.\n\n## Penyerapan dan distribusi\n\nDinding usus halus memiliki lipatan, vili, dan mikrovili yang memperbesar luas permukaan. Di dalam vili terdapat kapiler darah dan pembuluh limfa. Glukosa dan asam amino masuk ke kapiler darah, lalu dibawa melalui vena porta hepatika ke hati untuk diproses atau disimpan. Sebagian besar hasil pencernaan lemak dikemas dalam partikel yang masuk ke pembuluh limfa sebelum akhirnya bergabung dengan aliran darah. Serat pangan tidak dicerna oleh enzim manusia, tetapi membantu pergerakan feses dan sebagian dapat difermentasi mikrobiota usus.\n\n## Gangguan dan penerapan\n\nDiare mempercepat pengeluaran feses dan dapat menyebabkan kehilangan air serta elektrolit; rehidrasi penting untuk mencegah dehidrasi. Konstipasi sering berkaitan dengan kurang cairan, serat, aktivitas, atau perubahan rutinitas. Refluks asam terjadi ketika isi lambung naik ke esofagus. Tukak lambung dapat berkaitan dengan infeksi *Helicobacter pylori* atau penggunaan obat tertentu, bukan sekadar akibat makanan pedas. Intoleransi laktosa terjadi saat aktivitas laktase rendah sehingga laktosa tidak tercerna sempurna.\n\nUji zat makanan dapat membantu mengidentifikasi kandungan sampel: Lugol memberi warna biru-kehitaman jika ada pati; Benedict setelah pemanasan dapat berubah dari biru ke hijau/kuning/oranye hingga merah bata sesuai banyaknya gula pereduksi; Biuret menjadi ungu jika ada ikatan peptida; kertas buram dapat menunjukkan noda lemak. Uji ini bersifat kualitatif dan hasilnya perlu dibandingkan dengan kontrol.\n\n## Rangkuman\n\nPencernaan mengubah makanan secara mekanis dan kimiawi, penyerapan terutama berlangsung di usus halus, dan sisa dipadatkan di usus besar. Enzim bekerja spesifik pada substratnya, sedangkan empedu membantu pencernaan lemak tanpa bertindak sebagai enzim. Pola makan bervariasi, serat dan cairan cukup, kebersihan pangan, serta aktivitas fisik mendukung kesehatan sistem pencernaan.`,
    videoTitle: "Sistem Pencernaan Manusia - Biologi SMA",
    videoUrl: "https://www.youtube.com/watch?v=9Fqmnb87w1k",
  },
  {
    order: 4,
    title: "Sistem Pernapasan Manusia",
    slug: "sistem-pernapasan-manusia",
    description:
      "Mengkaji jalur udara, mekanisme ventilasi, pertukaran dan pengangkutan gas, serta dampak kebiasaan terhadap kesehatan paru.",
    objectives:
      "1. Mengurutkan saluran pernapasan serta menjelaskan fungsi tiap bagiannya.\n2. Membandingkan perubahan rongga dada saat inspirasi dan ekspirasi.\n3. Menjelaskan pertukaran dan pengangkutan oksigen serta karbon dioksida.\n4. Menafsirkan pengaruh aktivitas dan paparan polutan terhadap kerja sistem pernapasan.",
    content: `# Sistem Pernapasan Manusia\n\n## Fungsi dan gambaran umum\n\nSistem pernapasan memasok oksigen untuk respirasi sel dan membantu membuang karbon dioksida, produk metabolisme yang jika menumpuk mengganggu keseimbangan asam-basa tubuh. Pernapasan mencakup ventilasi (keluar-masuk udara), pertukaran gas di paru dan jaringan, pengangkutan gas oleh darah, serta pemakaian oksigen oleh sel. Pertukaran gas berbeda dari respirasi seluler: respirasi sel berlangsung di dalam sel, terutama mitokondria.\n\n## Jalur udara dan perlindungannya\n\n**Hidung/rongga hidung → faring → laring → trakea → bronkus → bronkiolus → alveolus.** Rongga hidung menyaring partikel dengan rambut dan mukus, serta menghangatkan dan melembapkan udara. Silia pada saluran napas membantu menggerakkan mukus menuju faring agar partikel dapat dikeluarkan atau ditelan. Laring mengandung pita suara; epiglotis membantu melindungi jalan napas saat menelan. Cincin tulang rawan menjaga trakea tetap terbuka. Bronkus bercabang menjadi bronkiolus yang lebih kecil, dan ujungnya berakhir pada kelompok alveolus.\n\nAlveolus berdinding sangat tipis, lembap, memiliki luas permukaan besar, dan dikelilingi jejaring kapiler. Ciri-ciri ini memperpendek jarak difusi serta mendukung pertukaran gas. Surfaktan yang dihasilkan sel alveolus membantu menurunkan tegangan permukaan sehingga alveolus tidak mudah kolaps.\n\n## Ventilasi: inspirasi dan ekspirasi\n\nUdara bergerak karena perbedaan tekanan antara atmosfer dan paru. Saat **inspirasi**, diafragma berkontraksi dan mendatar; otot antartulang rusuk luar membantu mengangkat tulang rusuk. Volume rongga dada bertambah, tekanan di dalam paru turun di bawah tekanan atmosfer, lalu udara masuk. Saat **ekspirasi normal**, otot-otot tersebut relaksasi, volume rongga dada berkurang, tekanan paru naik, dan udara keluar. Ekspirasi kuat juga melibatkan otot tambahan.\n\nIstilah pernapasan dada dan perut menggambarkan gerak yang lebih tampak pada tulang rusuk atau diafragma. Keduanya tetap merupakan perubahan volume rongga dada yang bekerja bersama, bukan dua jalur udara yang berbeda. Frekuensi dan kedalaman napas meningkat saat berolahraga karena jaringan menggunakan lebih banyak oksigen dan menghasilkan lebih banyak karbon dioksida.\n\n## Pertukaran dan pengangkutan gas\n\nDi alveolus, oksigen berdifusi dari udara alveolus ke darah karena perbedaan tekanan parsial. Sebagian besar oksigen berikatan sementara dengan hemoglobin di eritrosit membentuk oksihemoglobin; sebagian kecil larut dalam plasma. Di jaringan yang aktif, oksigen dilepas dari hemoglobin dan berdifusi ke sel. Karbon dioksida bergerak berlawanan arah dari jaringan ke darah. Sebagian besar diangkut sebagai ion bikarbonat, sedangkan sisanya larut dalam plasma atau berikatan dengan hemoglobin. Di paru, reaksi berlangsung kembali sehingga karbon dioksida dapat berdifusi ke alveolus dan dikeluarkan.\n\nPertukaran gas berlangsung efisien jika permukaan alveolus sehat, aliran darah memadai, dan udara dapat mencapai alveolus. Penyumbatan saluran, kerusakan dinding alveolus, atau gangguan aliran darah dapat menurunkan pertukaran gas walaupun seseorang bernapas lebih cepat.\n\n## Volume udara\n\nVolume tidal adalah udara yang keluar-masuk saat bernapas tenang. Setelah inspirasi biasa, seseorang masih dapat menarik udara tambahan (cadangan inspirasi); setelah ekspirasi biasa masih ada udara cadangan ekspirasi. Udara residu tetap berada di paru setelah ekspirasi maksimal dan membantu paru tidak sepenuhnya mengempis. Kapasitas vital merupakan jumlah udara maksimum yang dapat dikeluarkan setelah inspirasi maksimal. Nilai dalam mililiter berbeda menurut usia, ukuran tubuh, jenis kelamin biologis, kebugaran, dan kondisi kesehatan; angka perkiraan tidak boleh dianggap sebagai standar diagnosis individual.\n\n## Gangguan dan menjaga kesehatan\n\nAsma melibatkan penyempitan dan peradangan saluran napas yang dapat menimbulkan mengi serta sesak. Bronkitis adalah peradangan bronkus; pneumonia menginfeksi jaringan paru dan dapat mengganggu alveolus. Tuberkulosis disebabkan bakteri *Mycobacterium tuberculosis* dan terutama menyebar lewat udara dari penderita infeksi aktif. Emfisema merusak dinding alveolus sehingga luas pertukaran gas berkurang. Asap rokok, termasuk asap rokok orang lain, serta polusi udara meningkatkan risiko kerusakan saluran napas dan paru.\n\nOlahraga teratur mendukung kebugaran jantung-paru, tetapi tidak menghilangkan dampak rokok atau polusi. Ventilasi ruangan yang baik, menghindari asap, menggunakan pelindung yang sesuai saat kualitas udara buruk, dan mencari pertolongan medis saat sesak berat merupakan langkah yang lebih tepat.\n\n## Rangkuman\n\nVentilasi menggerakkan udara melalui perubahan volume dan tekanan. Alveolus menjadi tempat utama pertukaran O2 dan CO2, darah mengangkut gas tersebut, dan sel menggunakan oksigen untuk menghasilkan energi. Kinerja sistem dipengaruhi kondisi saluran napas, alveolus, sirkulasi, serta lingkungan.`,
    videoTitle: "Sistem Pernapasan Manusia - Biologi SMA",
    videoUrl: "https://www.youtube.com/watch?v=O_kKacJ9rcY",
  },
  {
    order: 5,
    title: "Sistem Peredaran Darah Manusia",
    slug: "sistem-peredaran-darah-manusia",
    description:
      "Menelusuri aliran darah melalui jantung, paru, dan jaringan serta memahami fungsi darah dan pembuluh.",
    objectives:
      "1. Menjelaskan struktur ruang jantung, katup, dan arah aliran darah.\n2. Membandingkan peredaran pulmonal dan sistemik serta ciri pembuluh darah.\n3. Menguraikan fungsi komponen darah dalam transportasi, pertahanan, dan pembekuan.\n4. Menjelaskan prinsip dasar golongan darah ABO dan Rh serta pentingnya uji kecocokan.",
    content: `# Sistem Peredaran Darah Manusia\n\n## Fungsi dan pola peredaran\n\nSistem peredaran mengangkut oksigen, karbon dioksida, zat gizi, hormon, panas, dan sisa metabolisme. Pada manusia, peredaran bersifat **tertutup** karena darah mengalir di dalam pembuluh dan **ganda** karena dalam satu putaran darah melewati jantung dua kali: sekali menuju paru dan sekali menuju seluruh tubuh. Darah yang menuju paru relatif rendah oksigen; darah yang kembali dari paru kaya oksigen.\n\n## Ruang jantung dan katup\n\nJantung memiliki empat ruang. Sisi kanan menerima darah dari tubuh dan memompanya ke paru; sisi kiri menerima darah dari paru dan memompanya ke tubuh.\n\n- **Atrium kanan** menerima darah dari tubuh melalui vena kava.\n- **Ventrikel kanan** memompa darah melewati katup pulmonal ke arteri pulmonalis menuju paru.\n- **Atrium kiri** menerima darah beroksigen dari paru melalui vena pulmonalis.\n- **Ventrikel kiri** memompa darah melewati katup aorta ke aorta dan seluruh tubuh. Dindingnya paling tebal karena harus menghasilkan tekanan tinggi untuk sirkulasi sistemik.\n\nKatup trikuspid berada di antara atrium kanan dan ventrikel kanan; katup mitral/bikuspid berada di antara atrium kiri dan ventrikel kiri. Katup pulmonal dan aorta berada di pangkal arteri. Katup membuka dan menutup mengikuti perbedaan tekanan untuk menjaga darah mengalir satu arah.\n\n## Jalur peredaran darah\n\n- **Peredaran pulmonal (kecil):** ventrikel kanan → arteri pulmonalis → kapiler paru (CO2 dilepas, O2 diambil) → vena pulmonalis → atrium kiri.\n- **Peredaran sistemik (besar):** ventrikel kiri → aorta → arteri dan kapiler jaringan (O2 serta zat gizi diserahkan) → vena → vena kava → atrium kanan.\n\nIstilah arteri dan vena ditentukan oleh arah aliran terhadap jantung, bukan kadar oksigennya. Karena itu, arteri pulmonalis membawa darah rendah oksigen menuju paru, sementara vena pulmonalis membawa darah kaya oksigen kembali ke jantung.\n\n## Pembuluh darah\n\n- **Arteri** membawa darah menjauhi jantung. Dindingnya relatif tebal, berotot, dan elastis untuk menahan tekanan denyut. Cabangnya menjadi arteriol yang mengatur distribusi aliran ke jaringan.\n- **Kapiler** memiliki dinding sangat tipis, terutama satu lapis sel endotel. Luas jejaring kapiler memungkinkan pertukaran gas, nutrisi, cairan, dan sisa metabolisme antara darah dan jaringan.\n- **Vena** membawa darah kembali ke jantung dengan tekanan lebih rendah. Banyak vena, terutama di anggota gerak, memiliki katup yang membantu mencegah aliran balik. Gerakan otot rangka membantu mendorong darah vena menuju jantung.\n\n## Komponen darah\n\nPlasma adalah bagian cair yang terutama terdiri atas air dan membawa protein, elektrolit, nutrisi, hormon, serta sisa metabolisme. Eritrosit mengandung hemoglobin yang mengikat oksigen secara reversibel. Leukosit berperan dalam pertahanan tubuh melalui beberapa jenis mekanisme, termasuk menelan patogen dan membentuk respons imun. Trombosit adalah fragmen sel yang berperan dalam hemostasis. Saat pembuluh terluka, trombosit berkumpul, faktor pembekuan bekerja berurutan, dan fibrin membantu membentuk bekuan untuk mengurangi perdarahan.\n\n## Golongan darah dan transfusi\n\nSistem ABO ditentukan oleh keberadaan antigen A dan/atau B pada permukaan eritrosit serta antibodi tertentu di plasma. Golongan A memiliki antigen A, B memiliki antigen B, AB memiliki keduanya, dan O tidak memiliki antigen A/B. Sistem Rh, terutama antigen D, menjadi pertimbangan penting lain. Jika antigen donor tidak cocok dengan antibodi penerima, sel darah merah dapat menggumpal dan pecah. Karena itu, transfusi memerlukan pemeriksaan golongan, uji silang, dan prosedur klinis; label “donor universal” atau “penerima universal” hanya penyederhanaan dasar dan tidak menggantikan pemeriksaan tersebut.\n\n## Menjaga kesehatan sirkulasi\n\nAktivitas fisik, tidur cukup, tidak merokok, serta pola makan seimbang mendukung kesehatan jantung dan pembuluh. Tekanan darah dipengaruhi banyak faktor dan satu kali pengukuran tidak cukup untuk menetapkan diagnosis. Hasil yang tinggi perlu dinilai tenaga kesehatan dengan pengukuran yang tepat dan berulang.\n\n## Rangkuman\n\nJantung bekerja sebagai pompa berkat kontraksi terkoordinasi dan katup satu arah. Peredaran pulmonal menghubungkan jantung dengan paru, sedangkan peredaran sistemik menghubungkan jantung dengan jaringan tubuh. Arteri, kapiler, vena, dan komponen darah memiliki struktur berbeda yang mendukung tugas transportasi, pertukaran, pertahanan, dan pembekuan.`,
    videoTitle: "Sistem Peredaran Darah Manusia - Biologi SMA",
    videoUrl: "https://www.youtube.com/watch?v=WpNE1qzt6iI",
  },
  {
    order: 6,
    title: "Ekosistem dan Interaksi Makhluk Hidup",
    slug: "ekosistem-dan-interaksi",
    description:
      "Menganalisis hubungan organisme dengan lingkungannya, aliran energi, perubahan ekosistem, dan upaya konservasi.",
    objectives:
      "1. Membedakan komponen biotik dan abiotik serta menjelaskan hubungan keduanya.\n2. Menganalisis rantai, jaring, dan piramida makanan sebagai representasi aliran energi.\n3. Membandingkan bentuk interaksi organisme dan memprediksi dampak perubahan populasi.\n4. Menjelaskan peran daur materi, suksesi, dan tindakan konservasi.",
    content: `# Ekosistem dan Interaksi Makhluk Hidup\n\n## Ekosistem sebagai sistem\n\nEkosistem adalah hubungan timbal balik antara komunitas makhluk hidup dan lingkungan fisiknya pada suatu tempat. Komunitas meliputi berbagai populasi; populasi adalah kumpulan individu satu spesies di area dan waktu tertentu. Batas ekosistem dapat dibuat untuk keperluan kajian, tetapi materi, organisme, dan energi dapat melintasi batas tersebut. Karena itu, perubahan di satu bagian dapat memengaruhi bagian lain.\n\nKomponen **biotik** mencakup produsen, konsumen, detritivor, dan pengurai. Produsen seperti tumbuhan dan alga menyimpan energi cahaya dalam senyawa organik melalui fotosintesis. Konsumen memperoleh energi dengan memakan organisme lain. Detritivor memakan serpihan organisme atau bahan organik mati, sedangkan bakteri dan jamur menguraikan bahan organik menjadi zat yang dapat kembali digunakan dalam ekosistem. Komponen **abiotik** meliputi cahaya, air, suhu, udara, pH, mineral tanah, salinitas, dan kondisi fisik lainnya.\n\n## Rantai makanan, jaring makanan, dan energi\n\nRantai makanan menunjukkan satu jalur perpindahan materi dan energi, misalnya **padi → belalang → katak → ular → elang**. Setiap tingkat disebut tingkat trofik. Dalam contoh ini, padi adalah produsen, belalang konsumen primer, katak konsumen sekunder, dan ular serta elang berada pada tingkat konsumen lebih tinggi. Organisme omnivor dapat menempati lebih dari satu tingkat trofik bergantung pada makanan yang dikonsumsi.\n\nDi alam, banyak organisme memiliki lebih dari satu sumber makanan dan lebih dari satu pemangsa. Hubungan itu membentuk **jaring-jaring makanan**, sehingga perubahan pada satu populasi dapat merambat melalui beberapa jalur. Jika pestisida menurunkan jumlah serangga, misalnya, pemakan serangga dapat kekurangan makanan; pemangsa pada tingkat berikutnya juga dapat terdampak. Dampak nyata bergantung pada banyaknya spesies alternatif dan kondisi lingkungan.\n\nEnergi mengalir satu arah: sebagian energi matahari ditangkap produsen, lalu sebagian berpindah ke konsumen dan pengurai. Di setiap tingkat, banyak energi digunakan untuk metabolisme dan terlepas sebagai panas, sehingga hanya sebagian kecil tersedia bagi tingkat berikutnya. Angka “sekitar 10%” adalah perkiraan umum, bukan nilai tetap untuk semua ekosistem. Berbeda dari energi, unsur seperti karbon, nitrogen, dan fosfor didaur ulang melalui proses biogeokimia.\n\nPiramida energi selalu mengecil ke arah tingkat trofik yang lebih tinggi karena energi yang tersedia berkurang. Piramida biomassa menggambarkan massa organisme per luas atau volume pada waktu tertentu; piramida jumlah menghitung banyaknya organisme. Bentuk piramida jumlah atau biomassa pada kondisi tertentu dapat terbalik, tetapi piramida energi tidak.\n\n## Bentuk interaksi antarorganisme\n\n- **Mutualisme (+/+)**: kedua pihak mendapat manfaat; contohnya serangga penyerbuk memperoleh nektar sementara membantu perpindahan serbuk sari.\n- **Komensalisme (+/0)**: satu pihak memperoleh manfaat dan pihak lain tidak banyak terpengaruh; contoh yang sering digunakan adalah anggrek yang menempel pada pohon untuk mendapatkan tempat tumbuh tanpa mengambil makanan dari pohon.\n- **Parasitisme (+/−)**: parasit memperoleh sumber daya dan inang dirugikan, seperti benalu pada tumbuhan inang.\n- **Predasi (+/−)**: predator menangkap dan memakan mangsa. Herbivori adalah bentuk interaksi ketika hewan memakan bagian tumbuhan.\n- **Kompetisi (−/−)**: organisme menggunakan sumber daya terbatas yang sama, seperti air, ruang, cahaya, atau pasangan. Kompetisi dapat terjadi di dalam satu spesies maupun antarspesies.\n\nInteraksi tidak selalu menghasilkan perubahan populasi yang sederhana. Ketersediaan sumber daya, penyakit, iklim, migrasi, dan hubungan lain turut memengaruhi ukuran populasi. Karena itu, data jangka waktu dan pembanding penting ketika menilai penyebab perubahan ekosistem.\n\n## Daur materi dan perubahan komunitas\n\nDalam **daur air**, penguapan dan transpirasi memindahkan air ke atmosfer; kondensasi membentuk awan; presipitasi mengembalikan air ke permukaan; infiltrasi dan aliran permukaan mengisi tanah serta perairan. Vegetasi membantu menahan tanah dan memengaruhi infiltrasi.\n\nDalam **daur karbon**, tumbuhan menyerap CO2 saat fotosintesis dan menyimpan karbon dalam biomassa. Respirasi, penguraian, pembakaran, dan aktivitas geologi mengembalikannya ke atmosfer atau perairan. Pembakaran bahan bakar fosil memindahkan karbon yang tersimpan lama ke atmosfer dalam waktu singkat sehingga mengubah keseimbangan karbon.\n\nDalam **daur nitrogen**, fiksasi mengubah nitrogen atmosfer menjadi bentuk yang dapat masuk ke ekosistem; bakteri tanah dan bintil akar legum berperan dalam proses ini. Nitrifikasi menghasilkan nitrit lalu nitrat. Tumbuhan menyerap amonium atau nitrat, nitrogen berpindah melalui makanan, dan penguraian mengembalikan senyawa nitrogen ke tanah. Denitrifikasi oleh bakteri mengembalikan nitrogen ke atmosfer. Fosfor terutama bersiklus melalui batuan, tanah, air, dan organisme; tahap atmosfernya tidak sebesar pada daur nitrogen atau karbon.\n\nSetelah gangguan, komunitas dapat berubah melalui **suksesi**. Suksesi primer dimulai pada permukaan yang hampir tidak memiliki tanah, sedangkan suksesi sekunder berlangsung ketika tanah masih tersedia, misalnya setelah kebakaran yang tidak menghilangkan seluruh tanah. Jalurnya tidak selalu berakhir pada satu komunitas yang sama; kondisi iklim, gangguan berulang, dan kedatangan spesies memengaruhi hasilnya.\n\n## Studi kasus dan konservasi\n\nPupuk berlebih yang terbawa ke danau dapat memicu ledakan alga. Saat alga mati dan diuraikan, mikroorganisme menggunakan banyak oksigen terlarut; kadar oksigen dapat turun dan mengganggu ikan. Kasus ini menunjukkan bahwa tindakan di daratan dapat berdampak pada perairan. Pengamatan yang baik membandingkan sumber nutrien, perubahan alga, oksigen terlarut, dan kondisi lokasi dari waktu ke waktu.\n\nKonservasi dapat dilakukan melalui perlindungan habitat, pemulihan lahan dan mangrove, koridor satwa, pengendalian spesies invasif, pengurangan pencemaran, serta pemanfaatan sumber daya secara berkelanjutan. Keanekaragaman membantu menjaga berbagai fungsi ekosistem, tetapi upaya pelestarian perlu disesuaikan dengan penyebab masalah dan melibatkan masyarakat setempat.\n\n## Rangkuman\n\nEkosistem menghubungkan komponen hidup dan tak hidup. Energi mengalir melalui tingkat trofik dan berkurang pada setiap perpindahan, sedangkan materi berputar dalam daur. Interaksi, gangguan, dan kondisi lingkungan membentuk perubahan populasi serta komunitas. Memahami hubungan sebab-akibat membantu kita memilih tindakan konservasi yang tepat.`,
    videoTitle: "Ekosistem dan Interaksi Makhluk Hidup - Biologi SMA",
    videoUrl: "https://www.youtube.com/watch?v=xkwHRf0iMdw",
  },
];

async function syncAssessmentBank() {
  let pretest = await prisma.pretest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  if (!pretest) {
    pretest = await prisma.pretest.create({
      data: { title: "Pretest Biologi SMA", description: "Tes awal 25 soal." },
    });
  }
  const savedPretestQuestions = await prisma.pretestQuestion.findMany({
    where: { pretestId: pretest.id },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  for (let i = 0; i < PRETEST.length; i++) {
    const item = PRETEST[i];
    const saved = savedPretestQuestions.find(
      (question) => question.order === i + 1
    );
    if (saved) {
      await prisma.pretestQuestion.update({
        where: { id: saved.id },
        data: { questionText: item.q, explanation: item.e },
      });
    } else {
      const question = await prisma.pretestQuestion.create({
        data: {
          pretestId: pretest.id,
          questionText: item.q,
          explanation: item.e,
          order: i + 1,
          points: 4,
        },
      });
      for (const [text, correct] of item.opts) {
        await prisma.pretestOption.create({
          data: {
            questionId: question.id,
            optionText: text,
            isCorrect: correct,
          },
        });
      }
    }
  }

  let posttest = await prisma.posttest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  if (!posttest) {
    posttest = await prisma.posttest.create({
      data: {
        title: "Posttest Biologi SMA",
        description: "Tes akhir 25 soal (berbeda dari pretest).",
      },
    });
  }
  const savedPosttestQuestions = await prisma.posttestQuestion.findMany({
    where: { posttestId: posttest.id },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  for (let i = 0; i < POSTTEST.length; i++) {
    const item = POSTTEST[i];
    const saved = savedPosttestQuestions.find(
      (question) => question.order === i + 1
    );
    if (saved) {
      await prisma.posttestQuestion.update({
        where: { id: saved.id },
        data: { questionText: item.q, explanation: item.e },
      });
    } else {
      const question = await prisma.posttestQuestion.create({
        data: {
          posttestId: posttest.id,
          questionText: item.q,
          explanation: item.e,
          order: i + 1,
          points: 4,
        },
      });
      for (const [text, correct] of item.opts) {
        await prisma.posttestOption.create({
          data: {
            questionId: question.id,
            optionText: text,
            isCorrect: correct,
          },
        });
      }
    }
  }
}

async function main() {
  if (process.argv.includes("--assessments-new-version-only")) {
    await prisma.$transaction(async (transaction) => {
      await transaction.pretest.updateMany({ where: { published: true }, data: { published: false } });
      await transaction.pretest.create({
        data: {
          title: "Pretest Biologi SMA",
          description: "Tes awal Biologi berbasis cerita dan analisis, 25 soal.",
          published: true,
          questions: { create: PRETEST.map((question, index) => ({
            questionText: question.q,
            explanation: question.e,
            order: index + 1,
            points: 4,
            options: { create: question.opts.map(([optionText, isCorrect]) => ({ optionText, isCorrect })) },
          })) },
        },
      });

      await transaction.posttest.updateMany({ where: { published: true }, data: { published: false } });
      await transaction.posttest.create({
        data: {
          title: "Posttest Biologi SMA",
          description: "Tes akhir Biologi berbasis cerita dan analisis, 25 soal.",
          published: true,
          questions: { create: POSTTEST.map((question, index) => ({
            questionText: question.q,
            explanation: question.e,
            order: index + 1,
            points: 4,
            options: { create: question.opts.map(([optionText, isCorrect]) => ({ optionText, isCorrect })) },
          })) },
        },
      });
    }, { timeout: 120000 });
    console.log("New assessment versions published; previous attempts and questions remain intact.");
    return;
  }

  if (process.argv.includes("--students-passwords-only")) {
    for (const student of DEMO_STUDENTS) {
      const passwordHash = await bcrypt.hash(student.password, 10);
      const result = await prisma.user.updateMany({
        where: { username: student.username, role: "STUDENT" },
        data: { passwordHash },
      });
      if (result.count !== 1) throw new Error(`Akun siswa ${student.username} tidak ditemukan.`);
    }
    console.log("Password 20 akun siswa demo berhasil diperbarui.");
    return;
  }

  if (process.argv.includes("--teachers-only")) {
    for (const teacher of DEMO_TEACHERS) {
      const result = await prisma.user.updateMany({
        where: { username: teacher.username, role: "TEACHER" },
        data: { name: teacher.name },
      });
      if (result.count !== 1) throw new Error(`Akun ${teacher.username} tidak ditemukan sebagai guru.`);
    }
    console.log("Nama tiga akun guru berhasil diperbarui.");
    return;
  }

  if (process.argv.includes("--assessments-only")) {
    await syncAssessmentBank();
    console.log(
      `Assessment bank synced: pretest=${PRETEST.length}, posttest=${POSTTEST.length}`
    );
    return;
  }
  const pw = await bcrypt.hash(process.env.SEED_PASSWORD ?? "Biolearn123", 10);

  // Akun demo hanya untuk pengembangan. Di produksi wajib meng-set
  // SEED_ADMIN_PASSWORD (atau membuat admin lewat proses bootstrap aman).
  const isProd = process.env.NODE_ENV === "production";
  const adminPw = process.env.SEED_ADMIN_PASSWORD;
  if (isProd && !adminPw) {
    console.warn(
      "[seed] Produksi tanpa SEED_ADMIN_PASSWORD — akun demo dilewati (materi & soal tetap diseed)."
    );
  }

  const admin =
    isProd && !adminPw
      ? null
      : await prisma.user.upsert({
          where: { username: "admin" },
          update: {},
          create: {
            name: "Administrator",
            username: "admin",
            email: "admin@biolearn.id",
            passwordHash: await bcrypt.hash(adminPw ?? "Biolearn123", 10),
            role: "ADMIN",
          },
        });

  const teachers = [];
  for (const [index, teacher] of DEMO_TEACHERS.entries()) {
    const i = index + 1;
    const u = await prisma.user.upsert({
      where: { username: teacher.username },
      update: { name: teacher.name },
      create: {
        name: teacher.name,
        username: teacher.username,
        email: teacher.email,
        passwordHash: pw,
        role: "TEACHER",
      },
    });
    await prisma.teacherProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, teacherCode: `GR-000${i}`, subject: "Biologi" },
    });
    teachers.push(u);
  }

  const students = [];
  for (const [index, student] of DEMO_STUDENTS.entries()) {
    const n = String(index + 1).padStart(2, "0");
    const legacyUsername = `student${n}`;
    const legacyUser = await prisma.user.findUnique({ where: { username: legacyUsername } });
    const matchingIdentity = legacyUser ?? await prisma.user.findFirst({ where: { OR: [{ username: student.username }, { email: student.email }] } });
    if (matchingIdentity && matchingIdentity.role !== "STUDENT") {
      throw new Error(`Tidak dapat mengganti identitas demo ${legacyUsername}: username/email tujuan sudah dipakai non-siswa.`);
    }
    if (matchingIdentity && matchingIdentity.username !== legacyUsername && (matchingIdentity.username !== student.username || matchingIdentity.email !== student.email)) {
      throw new Error(`Username/email tujuan untuk ${student.name} sudah dipakai akun lain.`);
    }
    const passwordHash = await bcrypt.hash(student.password, 10);
    const u = matchingIdentity
      ? await prisma.user.update({ where: { id: matchingIdentity.id }, data: { name: student.name, username: student.username, email: student.email, passwordHash, role: "STUDENT" } })
      : await prisma.user.create({ data: { name: student.name, username: student.username, email: student.email, passwordHash, role: "STUDENT" } });
    await prisma.studentProfile.upsert({
      where: { userId: u.id },
      update: { className: "X MIPA" },
      create: {
        userId: u.id,
        studentCode: `SW-${n}-BIO`,
        className: "X MIPA",
      },
    });
    students.push(u);
  }

  // Satu kelas demo dengan seluruh siswa dan guru agar alur admin mudah dipahami.
  const course1 = await prisma.course.upsert({
    where: { id: "course-biologi-mipa" },
    update: {
      name: "Biologi SMA MIPA - X MIPA",
      description: "Kelas Biologi untuk 20 siswa dengan tiga guru pengampu.",
    },
    create: {
      id: "course-biologi-mipa",
      name: "Biologi SMA MIPA - X MIPA",
      description: "Kelas Biologi untuk 20 siswa dengan tiga guru pengampu.",
    },
  });
  // Seed lama pernah membuat kelas kedua; hapus hanya kelas demo yang dikenal.
  await prisma.course.deleteMany({ where: { id: "course-biologi-mipa-2" } });

  // Ketiga guru mengampu satu kelas yang sama.
  const desiredTeacherLinks: Array<[string, string]> = [
    [teachers[0]!.id, course1.id],
    [teachers[1]!.id, course1.id],
    [teachers[2]!.id, course1.id],
  ];
  for (const [t, c] of desiredTeacherLinks) {
    await prisma.courseTeacher.upsert({
      where: { courseId_teacherId: { courseId: c, teacherId: t } },
      update: {},
      create: { courseId: c, teacherId: t },
    });
  }
  // Rapikan penugasan lama agar hanya tiga guru demo di kelas ini.
  await prisma.courseTeacher.deleteMany({
    where: {
      courseId: course1.id,
      NOT: {
        OR: desiredTeacherLinks.map(([t, c]) => ({
          teacherId: t,
          courseId: c,
        })),
      },
    },
  });

  // Semua 20 siswa berada pada kelas yang sama.
  const desiredStudentLinks = students.map((s) => [s.id, course1.id] as [string, string]);
  for (const [s, c] of desiredStudentLinks) {
    await prisma.courseStudent.upsert({
      where: { courseId_studentId: { courseId: c, studentId: s } },
      update: {},
      create: { courseId: c, studentId: s },
    });
  }
  // Hapus enrollment demo lama yang tidak termasuk pada daftar siswa aktif.
  await prisma.courseStudent.deleteMany({
    where: {
      courseId: course1.id,
      NOT: {
        OR: desiredStudentLinks.map(([s, c]) => ({
          studentId: s,
          courseId: c,
        })),
      },
    },
  });

  for (const m of MATERIALS) {
    const mat = await prisma.material.upsert({
      where: { slug: m.slug },
      update: {
        title: m.title,
        description: m.description,
        content: m.content,
        learningObjectives: m.objectives,
        order: m.order,
        published: true,
        fileName: `${m.slug}.pdf`,
        fileUrl: `/materials/${m.slug}.pdf`,
        fileType: "application/pdf",
      },
      create: {
        title: m.title,
        slug: m.slug,
        description: m.description,
        content: m.content,
        learningObjectives: m.objectives,
        order: m.order,
        published: true,
        fileName: `${m.slug}.pdf`,
        fileUrl: `/materials/${m.slug}.pdf`,
        fileType: "application/pdf",
      },
    });
    await prisma.video.upsert({
      where: { id: `video-${m.slug}` },
      update: { title: m.videoTitle, videoUrl: m.videoUrl, materialId: mat.id },
      create: {
        id: `video-${m.slug}`,
        materialId: mat.id,
        title: m.videoTitle,
        description: `Video pembelajaran: ${m.title}`,
        videoUrl: m.videoUrl,
        order: m.order,
        duration: "10:00",
      },
    });
  }

  await syncAssessmentBank();

  await prisma.manualBook.upsert({
    where: { id: "manual-book-1" },
    update: {},
    create: {
      id: "manual-book-1",
      title: "Buku Petunjuk Penggunaan BioLearn AI",
      description: "Panduan lengkap untuk siswa, guru, dan admin.",
      fileName: "manual-book-biolearn-ai.pdf",
      fileUrl: "/manuals/manual-book-biolearn-ai.pdf",
      fileType: "application/pdf",
      version: "1.0",
    },
  });

  console.log(
    `Seed OK: admin=${admin?.username ?? "(dilewati)"} , teachers=3, students=20, courses=2, materials=6, pretest=${PRETEST.length}, posttest=${POSTTEST.length}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
