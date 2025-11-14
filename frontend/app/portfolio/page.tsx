// FILE: app/portfolio/page.tsx
"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { CompanyListItem, portfolioAPI } from '../../lib/auth';
import { AuthContext, AuthContextType } from '../../components/auth/AuthProvider';
import PortfolioPageClient from '../../components/portfolio/PortfolioPageClient';

const PortfolioPage = () => {
    const { isAuthenticated, loading } = useContext(AuthContext as React.Context<AuthContextType>);
    const [companyList, setCompanyList] = useState<CompanyListItem[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await portfolioAPI.getAllCompaniesForDropdown();
                setCompanyList(data);
            } catch (error) {
                console.error("Failed to load company list for dropdown:", error);
            } 
        };
        fetchCompanies();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-green-500" size={32} />
                <span className="ml-3 text-lg text-gray-600">Checking authentication...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center p-10 text-xl text-red-600">
                Please log in to use the Portfolio Builder.
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px-100px)]">
            <PortfolioPageClient initialCompanies={companyList} />
        </div>
    );
};

export default PortfolioPage;
