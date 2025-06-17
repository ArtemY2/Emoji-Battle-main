import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import type { ReactElement } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Ranking from './pages/Ranking';
import Game from './pages/Game';
import Results from './pages/Results';
import Lobby from './pages/Lobby';
import QuickJoin from './pages/QuickJoin';
import DBTest from './components/DBTest';
import CloudDemo from './pages/CloudDemo';  // Исправлено
import SimpleCloudDemo from './pages/SimpleCloudDemo';  // Вместо CloudDemo


// 🔐 Защищённый маршрут
const PrivateRoute = ({ children }: { children: ReactElement }) => {
    const { user } = useAuthenticator((context) => [context.user]);
    return user ? children : <Navigate to="/" replace />;
};

const App: React.FC = () => {
    return (
        <Authenticator.Provider>
            <Router>
                <Routes>
                    {/* 🔓 Открытые страницы */}
                    <Route path="/" element={<Home />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/lobby/:roomId" element={<Lobby />} />
                    <Route path="/game/:roomId" element={<Game />} />
                    <Route path="/quick-join" element={<QuickJoin />} />
                    <Route path="/cloud-demo" element={<CloudDemo />} />  {/* Убрана запятая */}
                    <Route path="/db-test" element={<DBTest />} />
                    <Route path="/cloud-demo" element={<SimpleCloudDemo />} />
                    {/* 🔒 Приватные страницы */}
                    <Route path="/profile" element={
                        <PrivateRoute><Profile /></PrivateRoute>
                    } />
                    <Route path="/results/:gameId" element={
                        <PrivateRoute><Results /></PrivateRoute>
                    } />
                </Routes>
            </Router>
        </Authenticator.Provider>
    );
};

export default App;