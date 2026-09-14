export const disciplines = [
  { _id: "d1", label: "Cálculo I", order: 1, isActive: true },
  { _id: "d2", label: "Banco de Dados", order: 2, isActive: true },
  { _id: "d3", label: "Front-End Design", order: 3, isActive: true },
  { _id: "d4", label: "Engenharia de Software", order: 4, isActive: true },
];

export const statuses = {
  disponivel: { _id: "s1", label: "Disponível", order: 1 },
  reservado: { _id: "s2", label: "Reservado", order: 2 },
  trocado: { _id: "s3", label: "Trocado", order: 3 },
};

// users[i].password é usado só pra validar o login mockado (nunca faça
// isso em um back-end real — aqui é só pra facilitar o teste local)
export const users = [
  {
    id: "u1",
    name: "Ana Souza",
    username: "ana.souza",
    email: "ana@fiap.com.br",
    role: "ALUNO",
    password: "123456",
  },
  {
    id: "u2",
    name: "Bruno Lima",
    username: "bruno.lima",
    email: "bruno@fiap.com.br",
    role: "ALUNO",
    password: "123456",
  },
];

function author(userId) {
  const user = users.find((u) => u.id === userId);
  return {
    _id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
}

export const listings = [
  {
    _id: "l1",
    title: "Cálculo I - Stewart, 7ª edição",
    description: "Livro em bom estado, com algumas anotações a lápis nos primeiros capítulos.",
    condition: "usado",
    type: "venda",
    price: 45.0,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    discipline: { _id: "d1", label: "Cálculo I", order: 1 },
    author: author("u1"),
    status: statuses.disponivel,
    createDate: "2026-08-20T14:00:00.000Z",
    updateDate: "2026-08-20T14:00:00.000Z",
  },
  {
    _id: "l2",
    title: "Apostila de Banco de Dados - Modelagem Relacional",
    description: "Apostila impressa da faculdade, completa, sem rasuras.",
    condition: "seminovo",
    type: "troca",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
    discipline: { _id: "d2", label: "Banco de Dados", order: 2 },
    author: author("u2"),
    status: statuses.disponivel,
    createDate: "2026-08-21T09:30:00.000Z",
    updateDate: "2026-08-21T09:30:00.000Z",
  },
  {
    _id: "l3",
    title: "Don't Make Me Think - Steve Krug",
    description: "Livro de UX/Front-end, capa um pouco desgastada mas conteúdo intacto.",
    condition: "usado",
    type: "doacao",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
    discipline: { _id: "d3", label: "Front-End Design", order: 3 },
    author: author("u1"),
    status: statuses.reservado,
    createDate: "2026-08-15T11:00:00.000Z",
    updateDate: "2026-08-25T16:00:00.000Z",
  },
  {
    _id: "l4",
    title: "Apostila de CSS e Layout Responsivo",
    description: "Material da disciplina de Front-End Design, com exercícios resolvidos de Flexbox e Grid.",
    condition: "seminovo",
    type: "troca",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
    discipline: { _id: "d3", label: "Front-End Design", order: 3 },
    author: author("u2"),
    status: statuses.disponivel,
    createDate: "2026-08-27T10:00:00.000Z",
    updateDate: "2026-08-27T10:00:00.000Z",
  },
  {
    _id: "l5",
    title: "Clean Code - Robert C. Martin",
    description: "Usado na disciplina de Engenharia de Software. Bom estado, poucas marcações.",
    condition: "usado",
    type: "venda",
    price: 55.0,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    discipline: { _id: "d4", label: "Engenharia de Software", order: 4 },
    author: author("u1"),
    status: statuses.disponivel,
    createDate: "2026-08-28T13:20:00.000Z",
    updateDate: "2026-08-28T13:20:00.000Z",
  },
  {
    _id: "l6",
    title: "Apostila de Engenharia de Software - UML e Requisitos",
    description: "Apostila completa da disciplina, com diagramas e exemplos de levantamento de requisitos.",
    condition: "novo",
    type: "doacao",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
    discipline: { _id: "d4", label: "Engenharia de Software", order: 4 },
    author: author("u2"),
    status: statuses.disponivel,
    createDate: "2026-08-29T09:00:00.000Z",
    updateDate: "2026-08-29T09:00:00.000Z",
  },
];
