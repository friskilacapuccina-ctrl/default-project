export const SYSTEM_PROMPT = `Kamu adalah BioLearn AI Tutor, seorang tutor Biologi untuk siswa SMA jurusan MIPA.

Tugasmu membantu siswa memahami konsep Biologi.

Gunakan bahasa Indonesia yang: jelas, sederhana, edukatif, tidak terlalu formal, sesuai tingkat siswa SMA.

Jika konsep sulit:
1. jelaskan konsep utama
2. gunakan analogi sederhana
3. berikan contoh
4. berikan ringkasan

Jangan hanya memberikan jawaban. Bantu siswa memahami alasan di balik jawaban.

Jika siswa meminta jawaban soal yang sedang dikerjakan, berikan petunjuk dan penjelasan konsep terlebih dahulu.

Jika pertanyaan tidak berkaitan dengan Biologi, arahkan siswa kembali ke topik pembelajaran.`;

export async function askAI(opts: { userMessage: string; context?: string; language?: "id" | "en"; history?: Array<{ role: string; content: string }> }): Promise<string> {
  const language = opts.language ?? "id";
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.includes("your_openai")) {
    return fallbackAnswer(opts.userMessage, opts.context, language);
  }
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: key });
  try {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: (language === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT) + (opts.context ? `\n\n${language === "en" ? "Learning material context" : "Konteks materi"}:\n${opts.context.slice(0, 4000)}` : "") },
    ];
    for (const h of (opts.history ?? []).slice(-8)) {
      messages.push({ role: h.role === "USER" ? "user" : "assistant", content: h.content });
    }
    messages.push({ role: "user", content: opts.userMessage });
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });
    return res.choices[0]?.message?.content ?? (language === "en" ? "Sorry, I can't answer that yet. Please try asking again." : "Maaf, saya belum bisa menjawab. Coba tanyakan lagi.");
  } catch {
    return (
      fallbackAnswer(opts.userMessage, opts.context, language) +
      (language === "en"
        ? "\n\n(Note: the OpenAI service could not be reached, for example because the quota is exhausted. This answer is from BioLearn's offline mode.)"
        : "\n\n(Catatan: layanan OpenAI tidak dapat dihubungi (mis. kuota habis) — jawaban di atas dari mode offline BioLearn. Isi ulang kredit di platform.openai.com untuk AI penuh.)")
    );
  }
}

const SYSTEM_PROMPT_EN = `You are BioLearn AI Tutor, a biology tutor for high school students.

Help students understand biology clearly and accurately. Use friendly, educational English suitable for high school students.

For difficult ideas: explain the core concept, use a simple analogy, give an example, and finish with a short summary.

Do not only give an answer; explain the reasoning. If a student asks for an answer to an active test question, guide them with hints and concepts first. If a question is unrelated to biology, gently guide them back to the learning topic.`;

function fallbackAnswer(q: string, context?: string, language: "id" | "en" = "id"): string {
  const lower = q.toLowerCase();
  if (language === "en") {
    return (
      (lower.includes("mitochond") || lower.includes("energy") || lower.includes("atp") ? "Mitochondria produce most of a cell's ATP through cellular respiration. Think of them as the cell's power plants. In short: glucose and oxygen are used to make ATP, carbon dioxide, and water." : null) ??
      (lower.includes("photosynth") || lower.includes("chlorophyll") || lower.includes("chloroplast") ? "Photosynthesis takes place in chloroplasts. Light energy helps plants turn carbon dioxide and water into glucose and oxygen. Chloroplasts work like a solar-powered kitchen for the plant." : null) ??
      (lower.includes("heart") || lower.includes("blood") || lower.includes("circulation") ? "Human circulation is a closed, double circulation system. The right side of the heart sends blood to the lungs, while the left side sends oxygen-rich blood to the rest of the body." : null) ??
      (lower.includes("respir") || lower.includes("lung") || lower.includes("alveol") ? "Air travels through the nose, pharynx, larynx, trachea, bronchi, and bronchioles before reaching the alveoli. Oxygen and carbon dioxide diffuse across the thin alveolar walls." : null) ??
      (lower.includes("digest") || lower.includes("stomach") || lower.includes("intestin") ? "Digestion begins in the mouth, continues through the esophagus and stomach, and proceeds mainly in the small intestine. Nutrients are absorbed through the intestinal lining; the large intestine absorbs much of the remaining water." : null) ??
      (lower.includes("ecosystem") || lower.includes("food chain") || lower.includes("symbiosis") ? "An ecosystem includes interactions between organisms and their physical environment. Energy moves through food chains from producers to consumers, while decomposers recycle nutrients." : null) ??
      (lower.includes("cell") || lower.includes("organel") || lower.includes("nucleus") ? "A cell is the smallest unit of life. The nucleus stores DNA and helps regulate cell activities, ribosomes build proteins, and mitochondria release usable energy. These organelles work together like departments in a small factory." : null) ??
      `That's a good question! ${context ? "Based on the material you are viewing, " : ""}the key is to connect the definition, the process, and an example. Which part would you like me to explain first?`
    );
  }
  const pick = (kw: string[], text: string) => (kw.some((k) => lower.includes(k)) ? text : null);
  return (
    pick(["mitokondria", "energi", "atp"], "Mitokondria adalah organel penghasil energi sel. Ia menghasilkan ATP melalui respirasi seluler (glikolisis → siklus Krebs → fosforilasi oksidatif). Analoginya seperti 'pembangkit listrik' sel. Ringkasan: glukosa + O2 → ATP + CO2 + H2O.") ??
    pick(["fotosintesis", "klorofil", "kloroplas"], "Fotosintesis terjadi di kloroplas: 6CO2 + 6H2O + cahaya → C6H12O6 + 6O2. Tahap terang di membran tilakoid, tahap gelap (siklus Calvin) di stroma. Analoginya seperti 'dapur' tumbuhan yang memasak makanan dari cahaya.") ??
    pick(["jantung", "darah", "peredaran"], "Sistem peredaran darah manusia adalah peredaran ganda tertutup: jantung 4 ruang memompa darah ke paru-paru (peredaran kecil) dan ke seluruh tubuh (peredaran besar). Contoh: darah kaya O2 dari ventrikel kiri → aorta → tubuh → kembali via vena ke atrium kanan.") ??
    pick(["pernapasan", "paru", "alveolus"], "Sistem pernapasan: udara masuk hidung → faring → laring → trakea → bronkus → bronkiolus → alveolus tempat difusi O2/CO2. Inspirasi dibantu otot diafragma dan interkostal. Analogi: alveolus seperti 'spons kecil' memperluas permukaan pertukaran gas.") ??
    pick(["pencernaan", "lambung", "usus"], "Sistem pencernaan: mulut (amilase) → esofagus → lambung (pepsin, HCl) → usus halus (tripsin, lipase, amilase pankreas; penyerapan di vili) → usus besar (absorpsi air) → anus. Contoh: protein dipecah menjadi asam amino di lambung dan usus halus.") ??
    pick(["ekosistem", "rantai makanan", "simbiosis"], "Ekosistem adalah interaksi makhluk hidup dengan lingkungannya. Contoh rantai makanan: padi → belalang → katak → ular → elang. Simbiosis: mutualisme (lebah-bunga), komensalisme (anggrek-pohon), parasitisme (benalu-pohon).") ??
    pick(["sel", "organel", "nukleus"], "Sel adalah unit terkecil kehidupan. Organel penting: nukleus (pusat kendali/DNA), ribosom (sintesis protein), RE (transport), badan Golgi (modifikasi protein), lisosom (pencernaan sel). Analogi: sel seperti 'pabrik' dengan tiap organel sebagai divisinya.") ??
    `Pertanyaan yang bagus! ${context ? "Berdasarkan materi yang sedang kamu buka, " : ""}konsep kuncinya adalah memahami definisi, proses, dan contohnya. Coba uraikan: (1) apa yang kamu ketahui, (2) bagian mana yang membingungkan? Lalu tanyakan bagian spesifik itu agar saya bisa menjelaskan dengan analogi sederhana.\n\n(Catatan: mode fallback aktif — hubungkan OPENAI_API_KEY untuk jawaban AI penuh.)`
  );
}
