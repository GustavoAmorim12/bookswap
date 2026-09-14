import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getListingByIdRequest } from "../services/listingService";

/**
 * Guarda de rota por posse do recurso, em vez de por papel fixo: verifica
 * se o usuário logado é o autor do anúncio que está tentando editar/excluir.
 *
 * Importante: esta checagem é apenas UX (evita telas de edição inúteis).
 * A autorização real e vinculante deve ser validada no back-end a cada
 * requisição de escrita.
 */
export default function RequireOwner() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;
    getListingByIdRequest(id)
      .then((listing) => {
        if (active) setIsOwner(listing.author._id === user?.id);
      })
      .catch(() => {
        if (active) setIsOwner(false);
      });

    return () => {
      active = false;
    };
  }, [id, user]);

  if (isOwner === null) return null; // TODO: trocar por um spinner/loading
  if (!isOwner) return <Navigate to="/" replace />;

  return <Outlet />;
}
