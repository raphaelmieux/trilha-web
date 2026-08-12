// Fixed catalog (not tied to any individual account) so the "forgot password" form
// never has to reveal which question a given e-mail has configured — that would
// leak whether the account exists. Everyone picks from the same list at
// registration and again when resetting.
export const SECURITY_QUESTIONS: { code: string; label: string }[] = [
  { code: 'club_name', label: 'Qual o nome do seu Clube de Desbravadores?' },
  { code: 'first_pet', label: 'Qual foi o nome do seu primeiro animal de estimação?' },
  { code: 'birth_city', label: 'Em qual cidade você nasceu?' },
  { code: 'mother_maiden_name', label: 'Qual o nome de solteira da sua mãe?' },
  { code: 'first_school', label: 'Qual foi o nome da sua primeira escola?' },
  { code: 'favorite_food', label: 'Qual é o seu prato de comida favorito?' },
];

const COMBINING_MARKS = /[̀-ͯ]/g;

function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, ''); // strip accents so "José"/"jose" match
}

export async function hashSecurityAnswer(answer: string): Promise<string> {
  const data = new TextEncoder().encode(normalizeAnswer(answer));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
