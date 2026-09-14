import StaticPage from "../components/layout/StaticPage";

export default function ComoFunciona() {
  return (
    <StaticPage title="Como funciona">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          1. Publique um anúncio
        </h2>
        <p>
          Tire uma foto do material, escreva uma breve descrição, escolha a
          disciplina e diga se você quer trocar, vender ou doar.
        </p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          2. Encontre o que precisa
        </h2>
        <p>
          Use a busca e os filtros por disciplina, tipo de negociação ou
          faixa de preço pra achar materiais que outros alunos já
          anunciaram.
        </p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          3. Combine diretamente com o autor
        </h2>
        <p>
          Cada anúncio mostra o nome e o e-mail de quem publicou. A
          negociação (local de entrega, forma de pagamento, etc.) é
          combinada diretamente entre as partes.
        </p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          4. Gerencie seus anúncios
        </h2>
        <p>
          Em "Meus anúncios" você edita ou exclui o que publicou a qualquer
          momento. Só o autor de um anúncio pode alterá-lo.
        </p>
      </div>
    </StaticPage>
  );
}
