import { useState } from 'react';

function AuthPage({ setCurrentUser }) {
  // Auth flow state
  const [mode, setMode] = useState('');
  const [role, setRole] = useState('');
  const [major, setMajor] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const stemMajors = [
    'Computer Science',
    'Computer Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Chemical Engineering',
    'Electrical & Computer Engineering',
    'Financial Engineering',
    'Mathematics',
    'Physics',
    'IDM',
    'BTM',
    'BMS',
    'Other'
  ];

  const departments = [
    'Computer Science',
    'Computer Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Chemical Engineering',
    'Electrical & Computer Engineering',
    'Financial Engineering',
    'Mathematics',
    'Physics',
    'IDM',
    'BTM',
    'BMS',
    'Other'
  ];

  // Shared submit handler for login and registration.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const form = e.target;

    const payload = {
      role,
      email: form.email.value,
      password: form.password.value,
    };

    if (mode === 'register') {
      payload.name = form.name.value;

      if (role === 'student') {
        payload.major = major === 'Other' ? form.otherMajor.value : major;
      }

      if (role === 'professor') {
        payload.department =
          department === 'Other' ? form.otherDepartment.value : department;
      }
    }

    const endpoint =
      mode === 'login'
        ? 'http://127.0.0.1:5000/api/login'
        : 'http://127.0.0.1:5000/api/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      setMessage('Could not connect to server.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-shell">
        {/* Left-side portal branding */}
        <section className="auth-brand-panel">
          <p className="auth-brand-name">ResearchHub</p>
          <p>
            Track projects, milestones, reports, and feedback 
            all in one structured workspace.
          </p>

          <div className="auth-brand-pills">
            <span>+ Projects</span>
            <span>+ Milestones</span>
            <span>+ Feedback</span>
          </div>
        </section>

        <div className="auth-card">
          {/* Landing choice: log in or register */}
          {!mode && (
            <div className="auth-heading">
              <h2>Your Research Journey Starts Here!</h2>
            </div>
          )}

          {!mode && (
            <div className="button-group">
              <button onClick={() => setMode('login')}>Log In</button>
              <button onClick={() => setMode('register')}>Register</button>
            </div>
          )}

          {/* Role selection */}
          {mode && !role && (
            <div className="button-group">
              <div className="auth-heading">
                <p className="auth-eyebrow">
                  {mode === 'login' ? 'Log in as' : 'Register as'}
                </p>
              </div>

              <button onClick={() => setRole('student')}>Student</button>
              <button onClick={() => setRole('professor')}>Professor</button>

              <button
                type="button"
                onClick={() => {
                  setMode('');
                  setRole('');
                  setMessage('');
                }}
              >
                Back
              </button>
            </div>
          )}

          {/* Login/register form */}
          {mode && role && (
            <form onSubmit={handleSubmit}>
              <div className="auth-heading">
                <p className="auth-eyebrow">
                  {role === 'student' ? 'Student Access' : 'Professor Access'}
                </p>
                <h2>
                  {mode === 'login'
                    ? `Log in as ${role === 'student' ? 'Student' : 'Professor'}`
                    : `Register as ${role === 'student' ? 'Student' : 'Professor'}`}
                </h2>
              </div>

            {message && <p className="message">{message}</p>}

            {mode === 'register' && (
              <input name="name" type="text" placeholder="Name" />
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={() => setMessage('')}
            />

            <div className="password-container">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                onChange={() => setMessage('')}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {mode === 'register' && role === 'student' && (
              <>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                >
                  <option value="">Select major</option>
                  {stemMajors.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {major === 'Other' && (
                  <input
                    name="otherMajor"
                    type="text"
                    placeholder="Enter your major"
                  />
                )}
              </>
            )}

            {mode === 'register' && role === 'professor' && (
              <>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {department === 'Other' && (
                  <input
                    name="otherDepartment"
                    type="text"
                    placeholder="Enter your department"
                  />
                )}
              </>
            )}

            <div className="button-group">

              <button type="submit">
                {mode === 'login' ? 'Log In' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('');
                  setMajor('');
                  setDepartment('');
                  setMessage('');
                }}
              >
                Back
              </button>

              
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
