import http from "@api/http";

export async function getQuestions() {
  const { data } = await http.get("/api/v1/checkup/questions");
  return data; // { version, questions: [...] }
}

export async function runCheckup(answersObj) {
  // answersObj: { question_id:boolean, ... }
  const payload = Object.entries(answersObj).map(([k, v]) => ({
    question_id: k,
    value: v ? "yes" : "no",
  }));
  const { data } = await http.post("/api/v1/audit/checkup", payload);
  return data; // { score, max_score, recommendations }
}
