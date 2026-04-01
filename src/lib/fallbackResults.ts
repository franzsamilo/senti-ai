import type {
  Song,
  AttachmentStyle,
  LoveLanguage,
  ProfileResult,
  ThreatLevel,
} from "./types";

const ATTACHMENT_LABELS: Record<AttachmentStyle, string> = {
  anxious: "Anxious",
  avoidant: "Avoidant",
  disorganized: "Disorganized",
  secure: "Secure",
};

const LOVE_LANGUAGE_LABELS: Record<LoveLanguage, string> = {
  words: "Words of Affirmation",
  acts: "Acts of Service",
  gifts: "Receiving Gifts",
  time: "Quality Time",
  touch: "Physical Touch",
};

function computeThreatLevel(avgPain: number): ThreatLevel {
  if (avgPain >= 8) return "CRITICAL";
  if (avgPain >= 6.5) return "SEVERE";
  if (avgPain >= 5) return "ELEVATED";
  if (avgPain >= 3) return "MODERATE";
  return "LOW";
}

function computeDrunkTextProbability(
  avgPain: number,
  attachmentStyle: AttachmentStyle
): number {
  let base = Math.round(avgPain * 8);
  if (attachmentStyle === "anxious") base += 20;
  if (attachmentStyle === "disorganized") base += 12;
  if (attachmentStyle === "avoidant") base -= 5;
  if (attachmentStyle === "secure") base -= 15;
  return Math.min(99, Math.max(5, base));
}

function computeEmotionalDamageScore(
  avgPain: number,
  attachmentStyle: AttachmentStyle,
  mbti: string
): number {
  let score = avgPain;
  if (attachmentStyle === "anxious") score += 0.8;
  if (attachmentStyle === "disorganized") score += 0.6;
  if (attachmentStyle === "avoidant") score += 0.3;
  if (mbti.includes("F")) score += 0.4;
  if (mbti.includes("N")) score += 0.2;
  return Math.min(10.0, Math.max(0.1, parseFloat(score.toFixed(1))));
}

function getBehavioralPredictions(
  topSong: Song,
  mbti: string,
  attachmentStyle: AttachmentStyle,
  loveLanguage: LoveLanguage[],
  zodiac: string
): string[] {
  const attachLabel = ATTACHMENT_LABELS[attachmentStyle];
  const llLabel = loveLanguage.map((l) => LOVE_LANGUAGE_LABELS[l]).join(" + ");

  const predictions: string[] = [
    // Prediction 1 — song-based
    `Nakikinig ka sa "${topSong.title}" at nagsasabi na okay ka na, pero ang phone mo ay bukas sa kanyang Instagram profile. Hindi iyon healing, bestie — iyon ay evidence gathering.`,

    // Prediction 2 — MBTI + attachment
    mbti.includes("I")
      ? `Bilang ${mbti} na may ${attachLabel} attachment, ang lahat ng hindi mo nasabi ay naka-draft sa Notes app mo. May folder kang tinatawag na "Drafts Na Hindi Masesend" at may pitong entries doon. Siyam kung kasama mo yung voice messages.`
      : `Bilang ${mbti} na may ${attachLabel} attachment, sinesend mo sa barkada GC ang bawat screenshot ng kausap mo para sa collective analysis. Ang barkada mo ay tired na pero hindi nila kaya sabihin sa'yo dahil mahal ka nila.`,

    // Prediction 3 — love language
    `Ang love language mo ay ${llLabel} — ${loveLanguage.length > 1 ? `${loveLanguage.length} love languages? Over naman. Hindi mo alam kung ano talaga gusto mo, kaya lahat gusto mo. Classic.` : loveLanguage.includes("words") ? `nagre-replay ka ng bawat "okay" at "haha" para hanapin ang hidden meaning. Spoiler: wala.` : loveLanguage.includes("acts") ? `nagse-serbisyo ka nang walang kapalit. Sabi mo "gusto ko lang tumulong." Hindi. Nagbabayad ka ng emotional rent.` : loveLanguage.includes("gifts") ? `ang gusto mo lang ay malinaw na "mahal kita" — hindi isang Chatime.` : loveLanguage.includes("time") ? `kapag hindi niya inuna ang oras niya, personal na atake agad. Classic.` : `"hug na lang natin iyan" ang puso ng relasyon mo. Naconfuse ka sa physical intimacy at emotional availability.`}`,

    // Prediction 4 — zodiac
    `Bilang ${zodiac}, alam ng universe na may tendency kang romanticize yung sitwasyon hanggang sa mas maganda na ang version sa isip mo kaysa sa katotohanan. Ang talking stage mo ay may cinematic score na. Sa totoong buhay walang background music, bestie.`,

    // Prediction 5 — the 3AM behavior
    `Sa susunod na habang buhay — o sa susunod na Sabado ng gabi — magbubukas ka ng Spotify sa 3AM, papalarugin mo ang "${topSong.title}", at mag-iisip ng isang bagay na hindi mo dapat isipin. Tapos magse-screenshot ka ng kanta para i-post sa IG story mo bilang pasaring. Walang mag-rereply pero alam ng universe kung kanino ito para.`,
  ];

  return predictions;
}

function getToxicTraits(
  mbti: string,
  attachmentStyle: AttachmentStyle,
  loveLanguage: LoveLanguage[]
): string[] {
  const traits: string[] = [];

  if (attachmentStyle === "anxious") {
    traits.push(
      "Serial double-texter na nagpapanggap na 'accidentally sent' — lahat ng follow-up message mo ay sinasadya at alam mo ito"
    );
  } else if (attachmentStyle === "avoidant") {
    traits.push(
      "Nagbibigay ng breadcrumbs imbes na malinaw na sagot — enough para hindi sila umalis, hindi enough para ma-label ang relasyon"
    );
  } else if (attachmentStyle === "disorganized") {
    traits.push(
      "Push-pull champion: malapit-malayo, mainit-malamig, present-ghost — sila ang nagtataka kung bakit confused ang crush nila"
    );
  } else {
    traits.push(
      "Suspiciously secure — ginagamit ang healthy communication skills para manalo ng arguments nang walang pagtataas ng boses"
    );
  }

  if (mbti.includes("F")) {
    traits.push(
      "Gumagawa ng emotional decisions tapos naghahanap ng logical justification pagkatapos — hindi iyan intuition, iyan ay rationalization"
    );
  } else {
    traits.push(
      "Ini-intellectualize ang lahat ng feelings para hindi na kailangang ma-feel — emotional bypass disguised as emotional maturity"
    );
  }

  if (loveLanguage.includes("words")) {
    traits.push(
      "Nagbibigay ng unsolicited affirmations bilang love bombing lite — sincere nga, pero overwhelming para sa taong hindi pa ready"
    );
  } else if (loveLanguage.includes("touch")) {
    traits.push(
      "Gumagamit ng physical closeness para maiwasan ang emotional intimacy — mas madaling humalik kaysa mag-'mahal kita'"
    );
  } else {
    traits.push(
      "Nag-aasahan ng reciprocal effort nang hindi sinasabi — tapos nagtatampo kapag hindi nagbigay ang tao ng expected response"
    );
  }

  return traits;
}

function getRedFlags(
  topSong: Song,
  mbti: string,
  attachmentStyle: AttachmentStyle,
  zodiac: string
): string[] {
  return [
    `Ang Spotify playlist nila ay puno ng "${topSong.title}" at katulad — maaaring nasa talking stage pa lang kayo pero ikaw na ang inspirasyon ng emotional support playlist nila`,
    `${ATTACHMENT_LABELS[attachmentStyle]} attachment style means ${
      attachmentStyle === "anxious"
        ? "mag-aasahan silang sumagot ka agad — ang 10 minutong delay ay isang krisis sa kanila"
        : attachmentStyle === "avoidant"
        ? "kapag naging serious na ang relasyon, mag-di-disappear sila sa pinaka-convenient na paraan para sa kanila"
        : attachmentStyle === "disorganized"
        ? "hindi mo malalaman kung gusto ka ba nila o ayaw ka nila — sila mismo hindi alam"
        : "ikaw ang mag-aayos ng lahat ng emotional problems mo nang mag-isa at inaasahan nila ang parehong level mula sa'yo"
    }`,
    `Bilang ${zodiac} na ${mbti}, ang tendency nila ay ${
      mbti.includes("P")
        ? "mag-leave ng lahat ng bagay na open-ended — walang closure, walang DTR, walang malinaw na sagot"
        : "mag-overplan ng relasyon hanggang sa masamid ang spontaneity at mawalan ng excitement"
    } — at ikaw ang magtatanggap ng lahat ng iyan`,
  ];
}

export function generateFallback(
  songs: Song[],
  mbti: string,
  attachmentStyle: AttachmentStyle,
  loveLanguage: LoveLanguage[],
  zodiac: string
): ProfileResult {
  const avgPain =
    songs.length > 0
      ? songs.reduce((sum, s) => sum + s.painIndex, 0) / songs.length
      : 5.5;

  const topSong =
    songs.length > 0
      ? songs.reduce((max, s) => (s.painIndex > max.painIndex ? s : max), songs[0])
      : { title: "Paubaya", artist: "Moira Dela Torre", mood: "letting_go" as const, painIndex: 9.8 };

  const threat_level = computeThreatLevel(avgPain);
  const drunk_text_probability = computeDrunkTextProbability(avgPain, attachmentStyle);
  const emotional_damage_score = computeEmotionalDamageScore(avgPain, attachmentStyle, mbti);
  const attachLabel = ATTACHMENT_LABELS[attachmentStyle];
  const llLabel = loveLanguage.map((l) => LOVE_LANGUAGE_LABELS[l]).join(" + ");

  const headline = `${mbti} na may ${attachLabel} attachment nakikinig ng "${topSong.title}" — nasa atin na tayo, bestie.`;

  const song_diagnosis =
    songs.length > 1
      ? `Ang playlist mo ay isang crime scene at ang ${topSong.artist} ang primary suspect. "${topSong.title}" bilang top-pain song mo (${topSong.painIndex}/10) ay nagpapatunay ng isang bagay: hindi ka okay kahit sabi mo okay ka. Average pain index ng buong playlist mo ay ${avgPain.toFixed(1)}/10 — para kang nag-curate ng soundtrack ng isang broken heart na ayaw aminin na sira. ${songs.length > 2 ? `Lahat ng ${songs.length} kanta mo ay may common theme: ang pag-asa na hindi dapat inaalagaan.` : "Kahit dalawa lang ang kanta mo, ramdam na ang lahat."}`
      : `"${topSong.title}" lang ang kailangan para malaman ang lahat. Pain index: ${topSong.painIndex}/10. Wala nang masabi pa. Ang isang kanta ay sinasabi na ang isang libong bagay na hindi mo sinasabi.`;

  const behavioral_predictions = getBehavioralPredictions(
    topSong,
    mbti,
    attachmentStyle,
    loveLanguage,
    zodiac
  );

  const toxic_traits = getToxicTraits(mbti, attachmentStyle, loveLanguage);

  const red_flags = getRedFlags(topSong, mbti, attachmentStyle, zodiac);

  const final_verdict = `${mbti} + ${attachLabel} attachment + ${llLabel} + ${zodiac} = isang tao na alam kung paano mahalin nang husto pero hindi pa alam kung paano tanggapin ang parehong klase ng pagmamahal. "${topSong.title}" on repeat ay hindi therapy — iyan ay emotional marination. Huwag kang mag-alala, bestie. Alam ng Senti.AI na somewhere sa playlist mo ay may kanta para sa recovery. Hindi pa lang siya yung pinakamalakas.`;

  const recommended_action =
    threat_level === "CRITICAL"
      ? "I-delete ang Spotify. I-archive ang lahat ng chats. Kumain ng kanin. Tumawag sa nanay mo. Touch grass. Mag-shower. Sa pagkakasunod-sunod na iyan."
      : threat_level === "SEVERE"
      ? "Mag-journaling — sa papel, hindi sa Notes app na pwedeng ma-screenshot. Uminom ng tubig. Huwag magbukas ng Instagram bago matulog. Try mo."
      : threat_level === "ELEVATED"
      ? "Mag-ikot sa labas. Hindi sa ex's street. Mag-gym. Mag-samgyupsal kasama yung mga taong hindi kailangang i-analyze ng barkada GC."
      : "I-continue ang current healing arc. Mayroon nang progress. Pero huwag masyado mag-self-congratulate — nakikita ko pa rin ang listening history mo."
      ;

  const compatibility_warning = `BABALA SA MAGIGING JOWA: Ito ay isang ${mbti} na may ${attachLabel} attachment style at ${llLabel} bilang love language. Mag-iisip silang mabuti bago magsalita ng "mahal kita" pero kapag sinabi na nila iyon, serious iyon. ${
    attachmentStyle === "anxious"
      ? "Handa kang sumagot agad sa lahat ng mensahe nila. Lahat. Kahit 3AM."
      : attachmentStyle === "avoidant"
      ? "Bigyan mo sila ng space kapag hiniling nila iyon — literal na space, hindi 'space na may constant check-in.'"
      : attachmentStyle === "disorganized"
      ? "Maging consistent. Hindi ka nila hihilingin ito pero ito ang pinakakailangan nila."
      : "Maging authentic. Hindi nila kailangan ng perfect — kailangan nila ng tunay."
  } Maganda ang kausap, mahirap lang i-read. Good luck.`;

  return {
    headline,
    threat_level,
    drunk_text_probability,
    ex_stalking_frequency:
      threat_level === "CRITICAL"
        ? "Tatlong beses sa isang gabi, pati na ang mga tagged photos ng mga taong hindi mo kilala"
        : threat_level === "SEVERE"
        ? "Dalawang beses sa isang linggo, laging sa gabing tahimik"
        : threat_level === "ELEVATED"
        ? "Minsan sa isang linggo, kapag may lumabas na bagong post sila"
        : "Bihirang-bihira — nag-uunfollow ka na kaya mas madali",
    emotional_damage_score,
    behavioral_predictions,
    toxic_traits,
    red_flags,
    song_diagnosis,
    final_verdict,
    recommended_action,
    compatibility_warning,
  };
}
