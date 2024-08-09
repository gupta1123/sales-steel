
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Sidebar.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, resetState, AppDispatch, RootState } from '../store';
import { FiLogOut, FiHome, FiUsers, FiMap, FiUser, FiClipboard, FiDollarSign, FiSettings, FiBarChart2, FiMapPin } from 'react-icons/fi';

const sidebarItems = [
  { href: '/Dashboard', icon: FiHome, label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'FIELD OFFICER'] },
  { href: '/VisitsList', icon: FiMap, label: 'Visits List', roles: ['ADMIN', 'MANAGER', 'FIELD OFFICER'] },
  { href: '/Expense', icon: FiDollarSign, label: 'Expenses', roles: ['ADMIN', 'FIELD OFFICER'] },
  { href: '/Attendance', icon: FiClipboard, label: 'Attendance', roles: ['ADMIN'] },
  { href: '/Requirements', icon: FiClipboard, label: 'Requirements', roles: ['ADMIN', 'MANAGER', 'FIELD OFFICER'] },
  { href: '/Complaints', icon: FiClipboard, label: 'Complaints', roles: ['ADMIN', 'MANAGER', 'FIELD OFFICER'] },
  { href: '/DailyPricing', icon: FiDollarSign, label: 'Daily Pricing', roles: ['ADMIN', 'MANAGER'] },
  { href: '/Reports', icon: FiBarChart2, label: 'Reports', roles: ['ADMIN'] },
  { href: '/CustomerListPage', icon: FiUsers, label: 'Customers', roles: ['ADMIN', 'MANAGER', 'FIELD OFFICER'] },
  { href: '/Employeelist', icon: FiUser, label: 'Employee List', roles: ['ADMIN'] },
  { href: '/Settings', icon: FiSettings, label: 'Settings', roles: ['ADMIN'] },
];

const mobileHiddenItems = ['Employeelist', 'Settings'];

const BottomBar: React.FC<{ role: string | null }> = ({ role }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/Dashboard');

  useEffect(() => {
    setActiveTab(router.pathname);
  }, [router.pathname]);

  const filteredItems = sidebarItems.filter(item => 
    role && 
    item.roles.includes(role) && 
    !mobileHiddenItems.includes(item.href.slice(1))
  );

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(resetState());
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      router.push('/');
    } catch (error: any) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div style={{ zIndex: '1' }} className={`${styles.bottomBar} fixed bottom-0 left-0 right-0 bg-gray-800 flex overflow-x-auto items-center h-16 md:hidden`}>
      {filteredItems.map((item) => (
        <Link href={item.href} key={item.href}>
          <div className={`flex flex-col items-center px-3 ${activeTab === item.href ? 'text-purple-500' : 'text-white'}`}>
            <item.icon className="text-2xl" />
            <span className="text-xs">{item.label}</span>
          </div>
        </Link>
      ))}
      <div onClick={handleLogout} className="flex flex-col items-center px-3 text-white">
        <FiLogOut className="text-2xl" />
        <span className="text-xs">Logout</span>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    console.log('Current path:', router.pathname);
  }, [router.pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(resetState());
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      router.push('/');
    } catch (error: any) {
      console.error('Error logging out:', error);
    }
  };

  const filteredItems = sidebarItems.filter(item => role && item.roles.includes(role));

  return (
    <>
      <div style={{position:'fixed'}} className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Gajkesari</h2>
        </div>
        <div className="flex-grow overflow-y-auto">
          <ul className="py-4">
            {filteredItems.map((item) => (
              <li key={item.href} className="px-5 py-2">
                <Link href={item.href}>
                  <div className={`flex items-center p-2 rounded-md ${router.pathname === item.href ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
                    <item.icon className="mr-3" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center w-full p-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors">
            <FiLogOut className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <BottomBar role={role} />
      {/* Logout button for mobile view */}
      {/* <div className="md:hidden fixed top-4 left-4 z-10">
        <button onClick={handleLogout} className="flex items-center p-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors text-white">
          <FiLogOut className="mr-2 text-xl" />
          <span>Logout</span>
        </button>
      </div> */}
    </>
  );
};

export default Sidebar;
