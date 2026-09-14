import StaticPage from "../components/layout/StaticPage";

export default function Sobre() {
  return (
    <StaticPage title="Sobre o BookSwap">
      <p>
        O BookSwap é um marketplace criado para facilitar a troca, venda e
        doação de livros e materiais didáticos entre alunos. A ideia surgiu
        de um problema simples: no fim de cada semestre, muitos materiais
        acabam esquecidos numa prateleira, enquanto outros colegas
        precisariam justamente deles.
      </p>
      <p>
        Qualquer aluno pode publicar um anúncio do material que não usa
        mais, escolher se quer trocar, vender ou doar, e negociar
        diretamente com quem se interessar.
      </p>
      <p>
        Este projeto foi desenvolvido como parte do Tech Challenge (Fase 03)
        do curso de Full Stack Development. O código-fonte, a documentação
        de arquitetura e o contrato de API estão disponíveis no repositório
        do projeto.
      </p>
    </StaticPage>
  );
}
