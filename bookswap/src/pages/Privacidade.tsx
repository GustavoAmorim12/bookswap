import StaticPage from "../components/layout/StaticPage";

export default function Privacidade() {
  return (
    <StaticPage title="Política de privacidade">
      <p className="text-sm text-slate-500">
        Este é um projeto acadêmico (Tech Challenge). O texto abaixo é
        ilustrativo, para completar a experiência da aplicação.
      </p>
      <p>
        Guardamos apenas os dados necessários pro funcionamento da
        aplicação: nome, usuário e e-mail (para login e identificação de
        anúncios), e as informações que você escolhe publicar em cada
        anúncio.
      </p>
      <p>
        Seu e-mail fica visível para outros usuários na página de cada
        anúncio que você publicar, já que a negociação acontece diretamente
        entre autor e interessado.
      </p>
      <p>
        Não compartilhamos seus dados com terceiros para fins de
        publicidade.
      </p>
    </StaticPage>
  );
}
