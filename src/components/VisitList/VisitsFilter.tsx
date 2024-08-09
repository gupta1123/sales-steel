
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from 'lucide-react';
import AddVisits from '@/pages/AddVisits';

interface VisitsFilterProps {
    onFilter: (filters: { storeName: string; employeeName: string; purpose: string }, clearFilters: boolean) => void;
    onColumnSelect: (column: string) => void;
    onExport: () => void;
    selectedColumns: string[];
    viewMode: 'card' | 'table';
    startDate: Date | undefined;
    setStartDate: (date: Date | undefined) => void;
    endDate: Date | undefined;
    setEndDate: (date: Date | undefined) => void;
    purpose: string;
    setPurpose: (purpose: string) => void;
    storeName: string;
    setStoreName: (storeName: string) => void;
    employeeName: string;
    setEmployeeName: (employeeName: string) => void;
}

const VisitsFilter: React.FC<VisitsFilterProps> = ({
    onFilter,
    onColumnSelect,
    onExport,
    selectedColumns,
    viewMode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    purpose,
    setPurpose,
    storeName,
    setStoreName,
    employeeName,
    setEmployeeName,
}) => {
    const role = useSelector((state: RootState) => state.auth.role);
    const [debouncedStoreName, setDebouncedStoreName] = useState(storeName);
    const [debouncedEmployeeName, setDebouncedEmployeeName] = useState(employeeName);
    const [debouncedPurpose, setDebouncedPurpose] = useState(purpose);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ storeName, employeeName, purpose });

    useEffect(() => {
        const storeNameDebounceTimer = setTimeout(() => {
            setDebouncedStoreName(storeName);
        }, 300);

        return () => {
            clearTimeout(storeNameDebounceTimer);
        };
    }, [storeName]);

    useEffect(() => {
        const employeeNameDebounceTimer = setTimeout(() => {
            setDebouncedEmployeeName(employeeName);
        }, 300);

        return () => {
            clearTimeout(employeeNameDebounceTimer);
        };
    }, [employeeName]);

    useEffect(() => {
        const purposeDebounceTimer = setTimeout(() => {
            setDebouncedPurpose(purpose);
        }, 300);

        return () => {
            clearTimeout(purposeDebounceTimer);
        };
    }, [purpose]);

    const handleFilter = useCallback(() => {
        onFilter({ storeName: debouncedStoreName, employeeName: debouncedEmployeeName, purpose: debouncedPurpose }, false);
    }, [debouncedStoreName, debouncedEmployeeName, debouncedPurpose, onFilter]);

    useEffect(() => {
        handleFilter();
    }, [debouncedStoreName, debouncedEmployeeName, debouncedPurpose, handleFilter]);

    const handleAllowClear = (field: 'storeName' | 'employeeName' | 'purpose') => {
        setTempFilters(prev => ({ ...prev, [field]: '' }));
    };

    const columnMapping: Record<string, string> = {
        'Customer Name': 'storeName',
        'Executive': 'employeeName',
        'visit_date': 'visit_date',
        'Status': 'outcome',
        'purpose': 'purpose',
        'visitStart': 'visitStart',
        'visitEnd': 'visitEnd',
        'intent': 'intent',
    };

    const handleColumnSelect = (column: string) => {
        onColumnSelect(columnMapping[column]);
    };

    const formatDate = (date: Date | undefined) => {
        return date ? format(date, 'MMM d, yyyy') : '';
    };

    const handleSaveFilters = () => {
        setStoreName(tempFilters.storeName);
        setEmployeeName(tempFilters.employeeName);
        setPurpose(tempFilters.purpose);
        setIsDrawerOpen(false);
        onFilter(tempFilters, false);
    };

    const FilterContent = () => (
        <>
            <div className="space-y-4">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Customer Name"
                        value={tempFilters.storeName}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, storeName: e.target.value }))}
                        className="w-full"
                    />
                    {tempFilters.storeName && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => handleAllowClear('storeName')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Sales Executive Name"
                        value={tempFilters.employeeName}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, employeeName: e.target.value }))}
                        className="w-full"
                    />
                    {tempFilters.employeeName && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => handleAllowClear('employeeName')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Purpose"
                        value={tempFilters.purpose}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, purpose: e.target.value }))}
                        className="w-full"
                    />
                    {tempFilters.purpose && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => handleAllowClear('purpose')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Start Date: {formatDate(startDate)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                showOutsideDays
                            />
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full">
                                End Date: {formatDate(endDate)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                showOutsideDays
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </>
    );

    return (
        <>
            <div className="md:hidden">
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="py-4">
                            <FilterContent />
                        </div>
                        <SheetFooter>
                            <Button onClick={handleSaveFilters}>Apply Filters</Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <Card className="hidden md:block">
                <CardContent>
                    <div className="flex flex-wrap gap-4 justify-between">
                        <div className="flex flex-col sm:flex-row flex-grow space-y-2 sm:space-y-0 sm:space-x-4">
                            <FilterContent />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create Visits</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <AddVisits closeModal={() => setIsModalOpen(false)} />
                                </DialogContent>
                            </Dialog>
                            {viewMode === 'table' && (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">Columns</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {['Customer Name', 'Executive', 'visit_date', 'Status', 'purpose', 'visitStart', 'visitEnd', 'intent'].map(column => (
                                                <DropdownMenuCheckboxItem
                                                    key={column}
                                                    checked={selectedColumns.includes(columnMapping[column])}
                                                    onCheckedChange={() => handleColumnSelect(column)}
                                                >
                                                    {column}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {role === 'ADMIN' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">Bulk Actions</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={onExport}>Export</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default VisitsFilter;