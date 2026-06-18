
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { Navbar } from './components/layout/Navbar';

import { Home } from './pages/Home';
import { TaskDetail } from './pages/TaskDetail';
import { MaintainerDashboard } from './pages/manage/MaintainerDashboard';
import { TaskForm } from './pages/manage/TaskForm';
import { ManageTaskDetail } from './pages/manage/ManageTaskDetail';

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/manage" element={<MaintainerDashboard />} />
              <Route path="/manage/tasks/new" element={<TaskForm />} />
              <Route path="/manage/tasks/:id/edit" element={<TaskForm />} />
              <Route path="/manage/tasks/:id" element={<ManageTaskDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;
