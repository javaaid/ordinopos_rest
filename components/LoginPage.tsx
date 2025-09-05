import React, { useState } from 'react';
import { Employee, AppSettings, Language } from '../types';
import BuildingStorefrontIcon from './icons/BuildingStorefrontIcon';
import { useAppContext } from '../contexts/AppContext';
import PinPad from './PinPad';
import GoogleIcon from './icons/GoogleIcon';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import { ordinoLogoBase64 } from '../assets/logo';


const DateTimeDisplay: React.FC = () => {
    const [dateTime, setDateTime] = useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    return (
        <div className="text-center mb-8">
            <p className="text-5xl font-bold text-foreground tracking-wider">{dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-lg text-muted-foreground">{dateTime.toLocaleDateString(undefined, dateOptions)}</p>
        </div>
    );
};

interface LoginPageProps {
    settings: AppSettings;
}

export const LoginPage: React.FC<LoginPageProps> = ({ settings }) => {
    const { handlePinLogin, currentLocation, onLocationChange, isMultiStorePluginActive, locations, employees, setSettings } = useAppContext();
    
    if (!settings || !settings.advancedPOS) {
        return null; // Guard against settings prop being unavailable.
    }

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [pinError, setPinError] = useState('');
    const [employeeIdentifier, setEmployeeIdentifier] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isSsoLoading, setIsSsoLoading] = useState(false);

    const handleLanguageChange = (lang: Language) => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            language: {
                ...prev.language,
                staff: lang,
            },
        }));
    };

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setPinError('');
    };
    
    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const employee = employees.find(
            (emp: Employee) => emp.name.toLowerCase() === employeeIdentifier.toLowerCase().trim() || emp.id === employeeIdentifier.trim()
        );
        if (employee) {
            handleEmployeeSelect(employee);
        } else {
            setLoginError('Employee not found. Please try again.');
        }
    };
    
    const handleSsoLogin = () => {
        setIsSsoLoading(true);
        setLoginError(''); // Clear previous errors

        // Simulate network delay for SSO
        setTimeout(() => {
            const adminUser = employees.find((e: Employee) => e.id === 'emp_1');
            if (adminUser) {
                const success = handlePinLogin(adminUser.id, adminUser.pin);
                if (!success) {
                    setLoginError("Simulated SSO login failed. Check default admin credentials.");
                    setIsSsoLoading(false);
                }
            } else {
                setLoginError("Default admin user (emp_1) not found for SSO simulation.");
                setIsSsoLoading(false);
            }
        }, 1000);
    };

    const handlePinSubmit = (pin: string) => {
        if (selectedEmployee) {
            const success = handlePinLogin(selectedEmployee.id, pin);
            if (!success) {
                setPinError('Invalid PIN. Please try again.');
            }
        }
    };

    const handlePinPadClose = () => {
        setSelectedEmployee(null);
        setPinError('');
    };

    const backgroundImageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    
    return (
      <div className="min-h-screen w-screen bg-background grid grid-cols-1 lg:grid-cols-2">
        <div 
          className="hidden lg:block bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <div className="w-full h-full bg-black/50 flex flex-col justify-end p-12 text-white">
                <h2 className="text-4xl font-bold">The Modern POS for Modern Restaurants.</h2>
                <p className="text-lg mt-2 opacity-80">Fast, reliable, and beautiful. Everything you need to run your business efficiently.</p>
            </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute top-8 right-8 z-10">
                <LanguageSwitcher 
                    currentLanguage={settings.language.staff} 
                    onLanguageChange={handleLanguageChange} 
                />
            </div>
            <div className="w-full max-w-sm bg-card p-6 sm:p-8 rounded-xl shadow-md border border-border">
                <div className="flex flex-col items-center mb-6">
                    <img 
                        src={ordinoLogoBase64}
                        alt="Ordino POS Logo" 
                        className="w-48 h-auto drop-shadow-md"
                    />
                </div>
                <DateTimeDisplay />
                
                {!settings.advancedPOS.lockTillToLocation && isMultiStorePluginActive && locations.length > 1 && (
                    <div className="mb-6">
                        <label htmlFor="location" className="block text-sm font-medium mb-1 text-muted-foreground text-center">Location</label>
                        <div className="relative">
                            <BuildingStorefrontIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <select
                                id="location"
                                value={currentLocation.id}
                                onChange={(e) => onLocationChange(e.target.value)}
                                className="w-full bg-accent border border-border rounded-lg ps-10 pe-4 py-2 text-foreground focus:ring-primary focus:border-primary appearance-none"
                            >
                                {locations.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleContinue} className="space-y-4">
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium mb-1 text-muted-foreground">Employee Name or ID</label>
                        <Input
                            id="employeeId"
                            value={employeeIdentifier}
                            onChange={(e) => {
                                setEmployeeIdentifier(e.target.value);
                                if (loginError) setLoginError('');
                            }}
                            placeholder="Enter your name or ID"
                            className="text-center text-lg h-12"
                            required
                            autoFocus
                        />
                    </div>
                     <Button type="submit" className="w-full h-12 text-lg">
                        Continue
                    </Button>
                </form>

                <div className="text-destructive text-sm mt-2 text-center h-5">{loginError}</div>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground uppercase">OR</span>
                    <div className="flex-grow border-t border-border"></div>
                </div>

                <Button
                    onClick={handleSsoLogin}
                    disabled={isSsoLoading}
                    variant="outline"
                    className="w-full h-12 text-base"
                >
                    {isSsoLoading ? (
                        <>
                            <svg className="animate-spin -ms-1 me-3 h-5 w-5 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing In...
                        </>
                    ) : (
                        <>
                            <GoogleIcon className="w-6 h-6 me-3" />
                            Sign in with Google
                        </>
                    )}
                </Button>
            </div>

            {selectedEmployee && (
                <PinPad
                    employeeName={selectedEmployee.name}
                    onClose={handlePinPadClose}
                    onPinSubmit={handlePinSubmit}
                    error={pinError}
                />
            )}
        </div>
      </div>
    );
};