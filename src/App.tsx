import {Routes, Route } from 'react-router-dom'
import Mode from './components/sign/mode';
import AdminLayout from './components/admin/layout';
import Dashboard from './components/admin/dashboard/layout';
import UsersPage from './components/admin/user/users';
import ContentManager from './components/admin/content/contentpage';
import ContentCreatePage from './components/admin/content/contentcreate';
import ForumManager from './components/admin/questions/forum';
import StudentsPage from './components/admin/registers/register';
import StudentsEditPage from './components/admin/registers/editregisters';
import ContentEditPage from './components/admin/content/contentedit';
import ModuleCreatePage from './components/admin/content/createModulo';
import CreateProof from './components/admin/proof/createproof';
import ProofPage from './components/admin/proof/proofpage';
import PainelResultados from './components/admin/simulacao/simuClinica';
import LogsPage from './components/admin/emergencia/logs';
import CadastrarQuestaoSimulacao from './components/admin/simulacao/registerQuestions';
import RegisterSimulacao from './components/admin/simulacao/createSimulacao';
import NotificacaoEmail from './components/admin/notificacao/message';
import LiberacaoCertificados from './components/admin/certificado/liberacaoCert';
import AdminProfile from './components/admin/perfil/adperfil';


function App() {

  return (
    <Routes>
        <Route path="/" element={<Mode/>} />
        <Route path="admin" element={<AdminLayout/>}> 
            <Route path="dashboard" element={<Dashboard/>} />
            <Route path="usuarios" element={<UsersPage/>} />
            <Route path="content" element={<ContentManager/>} />
            <Route path="content/contentcreate" element={<ContentCreatePage/>} />
            <Route path="questions" element={<ForumManager/>} />
            <Route path="registers" element={<StudentsPage/>} />
            <Route path="registers/editregisters/:id" element={<StudentsEditPage/>} />
            <Route path="/admin/content/edit/:id" element={<ContentEditPage />} />
            <Route path="/admin/content/createModulo" element={<ModuleCreatePage />} />
            <Route path="proof" element={<ProofPage />} />
            <Route path="proof/createproof" element={<CreateProof />} />
            <Route path="simulacao" element={<PainelResultados />} />
            <Route path="simulacao/registerQuestions" element={<CadastrarQuestaoSimulacao />} />
            <Route path="simulacao/createSimulacao" element={<RegisterSimulacao />} />
            <Route path="emergencia/" element={<LogsPage />} />
            <Route path="notificacao/" element={<NotificacaoEmail />} />
            <Route path="certificado/" element={<LiberacaoCertificados />} />
            <Route path="perfil/" element={<AdminProfile />} />
          </Route>
    </Routes>
  );
}

export default App;
