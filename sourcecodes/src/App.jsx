import { useEffect, useState } from 'react';
import './App.css';
import AuthPage from './pages/Authpage';
import StudentDashboard from './pages/StudentDashboard';
import ProfDashboard from './pages/ProfDashboard';

function App() {
  // Keep the logged-in user after browser refresh.
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync login/logout state with localStorage.
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Authentication screen
  if (!currentUser) {
    return <AuthPage setCurrentUser={setCurrentUser} />;
  }

  // Role-based dashboard routing
  if (currentUser.role === 'student') {
    return (
      <StudentDashboard
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    );
  }

  if (currentUser.role === 'professor') {
    return (
      <ProfDashboard
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    );
  }
}

export default App;
