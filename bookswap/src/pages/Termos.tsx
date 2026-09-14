import StaticPage from "../components/layout/StaticPage";

export default function Termos() {
  return (
    <StaticPage title="Termos de uso">
      <p className="text-sm text-slate-500">
        Este é um projeto acadêmico (Tech Challenge). O texto abaixo é
        ilustrativo, para completar a experiência da aplicação, e não
        constitui um termo de uso juridicamente vinculante.
      </p>
      <p>
        Ao usar o BookSwap, você concorda em publicar anúncios verdadeiros
        sobre materiais que realmente possui, e em negociar de boa-fé com
        outros usuários.
      </p>
      <p>
        A responsabilidade pela negociação — condição do material, forma de
        pagamento, entrega — é exclusivamente das partes envolvidas. O
        BookSwap funciona como um espaço de anúncios e não participa das
        transações.
      </p>
      <p>
        Anúncios com informações falsas ou conteúdo impróprio podem ser
        removidos.
      </p>
    </StaticPage>
  );
}
