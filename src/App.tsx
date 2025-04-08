import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Profile } from './pages/Profile';
import { Users } from './pages/Users';
import { Companies } from './pages/Companies';
import { Categories } from './pages/Categories';
import { Dre } from './pages/Dre';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Topbar />

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/profile" element={<Profile />} />
              <Route path="/users" element={<Users />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/dre" element={<Dre />} />
              <Route path="/" element={
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-3xl font-bold">Bem-vindo ao Sistema</h1>
                  <p className="mt-4 text-zinc-400">
                    Esta página está em desenvolvimento. Em breve, você terá acesso a todas as funcionalidades do sistema.
                  </p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;