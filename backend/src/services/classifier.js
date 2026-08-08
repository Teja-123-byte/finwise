const categoryTerms = {
  food: ["food", "cafe", "coffee", "canteen", "swiggy", "zomato", "pizza", "restaurant", "grocery", "snack", "chai", "lunch", "dinner"],
  rent: ["rent", "hostel", "electricity", "water", "wifi", "broadband", "maintenance", "gas"],
  transport: ["uber", "ola", "metro", "bus", "train", "petrol", "fuel", "auto", "cab", "ticket"],
  education: ["book", "course", "tuition", "exam", "fee", "stationery", "printout", "udemy", "coursera"],
  entertainment: ["movie", "cinema", "concert", "game", "steam", "party", "outing", "bowling"],
  shopping: ["amazon", "flipkart", "myntra", "clothes", "shoes", "headphone", "gadget", "decor"],
  subscriptions: ["netflix", "spotify", "prime", "icloud", "youtube", "subscription", "chatgpt", "notion"],
  health: ["pharmacy", "medicine", "doctor", "gym", "clinic", "dentist"],
  allowance: ["allowance", "pocket money", "from home", "parents"],
  stipend: ["stipend", "intern", "scholarship", "salary"],
  freelance: ["freelance", "client", "gig", "project", "design work", "tutoring"],
};

/** A small weighted bag-of-words classifier. It is deterministic, fast, and needs no model download. */
export function classifyTransaction(note, kind) {
  const text = note.toLowerCase();
  const allowed = kind === "income" ? ["allowance", "stipend", "freelance"] : Object.keys(categoryTerms).filter((key) => !["allowance", "stipend", "freelance"].includes(key));
  const scores = allowed.map((category) => ({
    category,
    score: categoryTerms[category].reduce((score, term) => score + (text.includes(term) ? term.length : 0), 0),
  }));
  const best = scores.sort((a, b) => b.score - a.score)[0];
  const fallback = kind === "income" ? "allowance" : "other";
  return {
    category: best.score ? best.category : fallback,
    confidence: best.score ? Math.min(0.98, 0.5 + best.score / 20) : 0.35,
  };
}
