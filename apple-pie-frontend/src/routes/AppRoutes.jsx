import { Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout.jsx'
import PrivateLayout from '../layouts/PrivateLayout.jsx'
import PrivateRoute from '../components/PrivateRoute.jsx'
import Landing from '../pages/Landing.jsx'
import Login from '../pages/Login.jsx'
import Registro from '../pages/Registro.jsx'
import Home from '../pages/Home.jsx'
import Comunidades from '../pages/Comunidades.jsx'
import ComunidadDetalle from '../pages/ComunidadDetalle.jsx'
import Repositorio from '../pages/Repositorio.jsx'
import Foro from '../pages/Foro.jsx'
import Mentoria from '../pages/Mentoria.jsx'
import PerfilMentora from '../pages/PerfilMentora.jsx'
import MiPerfil from '../pages/MiPerfil.jsx'
import MiAgenda from '../pages/MiAgenda.jsx'
import DashboardMentora from '../pages/DashboardMentora.jsx'
import AgendaMentora from '../pages/AgendaMentora.jsx'
import MaterialesMentora from '../pages/MaterialesMentora.jsx'
import EditarPerfilMentora from '../pages/EditarPerfilMentora.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/comunidades" element={<Comunidades />} />
          <Route path="/comunidades/:id" element={<ComunidadDetalle />} />
          <Route path="/repositorio" element={<Repositorio />} />
          <Route path="/foro" element={<Foro />} />
          <Route path="/mentoria" element={<Mentoria />} />
          <Route path="/mentoria/:id" element={<PerfilMentora />} />
          <Route path="/perfil" element={<MiPerfil />} />
          <Route path="/agenda" element={<MiAgenda />} />
          <Route path="/mentora/dashboard" element={<DashboardMentora />} />
          <Route path="/mentora/agenda" element={<AgendaMentora />} />
          <Route path="/mentora/materiales" element={<MaterialesMentora />} />
          <Route path="/mentora/perfil" element={<EditarPerfilMentora />} />
        </Route>
      </Route>
    </Routes>
  )
}
