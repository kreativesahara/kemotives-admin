import { useNavigate } from 'react-router-dom';
import useLogout from '../../hooks/useLogout';

/**
 * Logout button component
 * Can be used standalone, in dropdown menus, or as mobile icon
 * @param {string} className - Custom class names
 * @param {boolean} isInDropdown - Whether the button is in a dropdown menu
 * @param {boolean} isMobileIcon - Whether to render as mobile icon with label below
 * @param {function} onLogout - Optional callback after logout
 */
const btnLogout = ({ className = '', isInDropdown = false, isMobileIcon = false, onLogout }) => {
  const navigate = useNavigate();
  const logout = useLogout();

  const signOut = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
    navigate('/home', { replace: true });
  };

  // Mobile icon variant - compact with icon and label
  if (isMobileIcon) {
    return (
      <button
        className="mobile-logout-btn flex flex-col items-center gap-1 text-white hover:text-red-400 transition group"
        onClick={signOut}
        aria-label="Logout"
      >
        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">logout</span>
        <span className="text-xs">Logout</span>
      </button>
    );
  }

  const baseClasses = isInDropdown
    ? 'block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition'
    : 'hover:bg-black text-white p-2 px-4 rounded-md';

  return (
    <button
      className={className || baseClasses}
      onClick={signOut}
    >
      <span className="material-symbols-outlined align-middle mr-2 text-sm">logout</span>
      {isInDropdown ? 'Logout' : 'LogOut?'}
    </button>
  );
};

export default btnLogout;