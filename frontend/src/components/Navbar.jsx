import { Menu, Search, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { token, logout } = useAuth();

    const nav = useNavigate();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        onScroll();                      // estado inicial
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const NavItem = ({ to, children }) => (
        <Link
            to={to}
            onClick={() => setMobileOpen(false)}
            className="block py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 lg:inline lg:py-0 lg:bg-transparent"
        >
            {children}
        </Link>
    );
    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all ${scrolled
                ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-sm'
                : 'bg-white dark:bg-gray-900'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* FILA PRINCIPAL */}
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-xl sm:text-2xl font-bold text-purple-600 hover:text-purple-500"
                    >
                        <img src="https://www.mp.gob.gt/wp-content/themes/ministerio-publico/assets/img/MP_logo.png" width={60} alt="Logo" className="h-8 sm:h-10 inline-block mr-2" />
                        MP-Expedientes DICRI
                    </Link>

                    {/* Navigation desktop */}
                    <nav className="ext-gray-700 dark:text-gray-200 hidden lg:flex space-x-4 xl:space-x-6">
                        <NavItem to="/">Inicio</NavItem>
                        {token && (
                            <>
                                <NavItem className="text-gray-700 dark:text-gray-200 hover:text-purple-600 transition text-sm xl:text-base" to="/expedientes-dicri">Expedientes DICRI</NavItem>
                                <NavItem to="/expedientes-dicri/nuevo">Nuevo expediente</NavItem>
                            </>
                        )}
                        {!token && <NavItem to="/register">Registrarse</NavItem>}
                    </nav>

                    {/* Botones de acción */}
                    <div className="ext-gray-700 dark:text-gray-200 flex items-center gap-2">
                        {/* Toggle búsqueda */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Carrito (ejemplo) */}
                        {/* <button className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] sm:text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                3
                            </span>
                        </button> */}

                        {/* User / logout */}
                        {token ? (
                            <button
                                onClick={() => {
                                    logout();
                                    nav('/login');
                                }}
                                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Cerrar sesión"
                            >
                                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        ) : (
                            <NavItem to="/login">
                                <User className="inline w-5 h-5 sm:w-6 sm:h-6" />
                            </NavItem>
                        )}

                        {/* Toggle menú móvil */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {mobileOpen ? (
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                {searchOpen && (
                    <div className="mt-2 border-t pt-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="search"
                                placeholder="Buscar…"
                                className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Menú móvil desplegable */}
                {mobileOpen && (
                    <div className="lg:hidden mt-3 border-t pt-3 space-y-2 pb-4">
                        <NavItem to="/">Inicio</NavItem>
                        {token ? (
                            <>
                                <NavItem to="/expedientes-dicri">Expedientes DICRI</NavItem>
                                <NavItem to="/expedientes-dicri/nuevo">Nuevo expediente</NavItem>
                                <hr className="border-gray-200 dark:border-gray-700" />
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileOpen(false);
                                        nav('/login');
                                    }}
                                    className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <NavItem to="/login">Iniciar sesión</NavItem>
                                <NavItem to="/register">Registrarse</NavItem>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
