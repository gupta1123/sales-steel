import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { RootState } from '../store';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, BarController, LineController, ChartOptions } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, BarController, LineController);

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
}

interface StoreStats {
    storeId: number;
    storeName: string;
    visitFrequency: number;
    intentLogs: { newIntentLevel: number }[];
    monthlySaleLogs: { newMonthlySale: number }[];
    intentLevel?: number;
    monthlySales?: number;
}

interface EmployeeOption {
    value: number;
    label: string;
}

const VisitFrequencyReport: React.FC = () => {
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
    const [storeStats, setStoreStats] = useState<StoreStats[]>([]);
    const [displayMode, setDisplayMode] = useState<'mostVisited' | 'leastVisited' | 'highestIntent' | 'lowestIntent' | 'highestSales' | 'lowestSales'>('mostVisited');
    const [startDate, setStartDate] = useState('2024-05-01');
    const [endDate, setEndDate] = useState('2024-06-30');

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        if (token) {
            fetchEmployees();
        }
    }, [token]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchStoreStats();
        }
    }, [selectedEmployee, startDate, endDate]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get<Employee[]>('https://api.gajkesaristeels.in/employee/getAll', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fieldOfficers = response.data.filter(emp => emp.role === "Field Officer");
            const employeeOptions = fieldOfficers
                .map((emp: Employee) => ({
                    value: emp.id,
                    label: `${emp.firstName} ${emp.lastName}`
                }))
                .sort((a, b) => a.label.localeCompare(b.label)); // Sort employees alphabetically
            setEmployees(employeeOptions);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };


    const fetchStoreStats = async () => {
        if (!selectedEmployee) return;
        try {
            const response = await axios.get<StoreStats[]>('https://api.gajkesaristeels.in/report/getStoreStats', {
                params: {
                    employeeId: selectedEmployee.value,
                    startDate,
                    endDate
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setStoreStats(response.data);
        } catch (error) {
            console.error('Error fetching store stats:', error);
        }
    };

    const handleEmployeeSelect = (selected: { value: number; label: string } | null) => {
        setSelectedEmployee(selected);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            setStartDate(value);
        } else if (name === 'endDate') {
            setEndDate(value);
        }
    };

    const getAverageIntentLevel = (store: StoreStats) => {
        if (store.intentLogs && store.intentLogs.length > 0) {
            const sum = store.intentLogs.reduce((acc, log) => acc + log.newIntentLevel, 0);
            return sum / store.intentLogs.length;
        }
        return store.intentLevel || 0;
    };

    const getAverageMonthlySales = (store: StoreStats) => {
        if (store.monthlySaleLogs && store.monthlySaleLogs.length > 0) {
            const sum = store.monthlySaleLogs.reduce((acc, log) => acc + log.newMonthlySale, 0);
            return sum / store.monthlySaleLogs.length;
        }
        return store.monthlySales || 0;
    };

    const sortedStoreStats = () => {
        const stats = [...storeStats];
        switch (displayMode) {
            case 'mostVisited':
                return stats.sort((a, b) => (b.visitFrequency || 0) - (a.visitFrequency || 0)).slice(0, 10);
            case 'leastVisited':
                return stats.sort((a, b) => (a.visitFrequency || 0) - (b.visitFrequency || 0)).slice(0, 10);
            case 'highestIntent':
                return stats.sort((a, b) => getAverageIntentLevel(b) - getAverageIntentLevel(a)).slice(0, 10);
            case 'lowestIntent':
                return stats.sort((a, b) => getAverageIntentLevel(a) - getAverageIntentLevel(b)).slice(0, 10);
            case 'highestSales':
                return stats.sort((a, b) => getAverageMonthlySales(b) - getAverageMonthlySales(a)).slice(0, 10);
            case 'lowestSales':
                return stats.sort((a, b) => getAverageMonthlySales(a) - getAverageMonthlySales(b)).slice(0, 10);
        }
    };

    const chartData = {
        labels: sortedStoreStats().map(store => store.storeName || `Store ${store.storeId}`),
        datasets: [
            {
                type: 'bar' as const,
                label: 'Visit Frequency',
                data: sortedStoreStats().map(store => store.visitFrequency || 0),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y',
            },
            {
                type: 'bar' as const,
                label: 'Average Intent Level',
                data: sortedStoreStats().map(store => getAverageIntentLevel(store)),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                yAxisID: 'y',
            },
            {
                type: 'line' as const,
                label: 'Average Monthly Sales',
                data: sortedStoreStats().map(store => getAverageMonthlySales(store)),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                yAxisID: 'y1',
            },
        ],
    };

    const chartOptions: ChartOptions<'bar' | 'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Store Statistics',
            },
        },
        scales: {
            x: {
                stacked: false,
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Visit Frequency / Intent Level',
                },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: 'Average Monthly Sales',
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-2">Select Employee</h3>
                    <Select
                        options={employees}
                        value={selectedEmployee}
                        onChange={handleEmployeeSelect}
                        className="basic-single"
                        classNamePrefix="select"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-2">Select Date Range</h3>
                    <div className="flex space-x-4">
                        <Input
                            type="date"
                            name="startDate"
                            value={startDate}
                            onChange={handleDateChange}
                            className="w-1/2"
                        />
                        <Input
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={handleDateChange}
                            className="w-1/2"
                        />
                    </div>
                </CardContent>
            </Card>

            {selectedEmployee && (
                <>
                    <div className="flex space-x-2 flex-wrap">
                        <Button onClick={() => setDisplayMode('mostVisited')}>Most Visited</Button>
                        <Button onClick={() => setDisplayMode('leastVisited')}>Least Visited</Button>
                        <Button onClick={() => setDisplayMode('highestIntent')}>Highest Intent</Button>
                        <Button onClick={() => setDisplayMode('lowestIntent')}>Lowest Intent</Button>
                        <Button onClick={() => setDisplayMode('highestSales')}>Highest Sales</Button>
                        <Button onClick={() => setDisplayMode('lowestSales')}>Lowest Sales</Button>
                    </div>

                    <Card>
                        <CardContent>
                            <Chart type="bar" options={chartOptions} data={chartData} />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default VisitFrequencyReport;