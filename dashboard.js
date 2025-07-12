import React, { useState, useEffect } from "react";
import { SupportTicket } from "@/entities/SupportTicket";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    Ticket, 
    Clock, 
    AlertTriangle, 
    CheckCircle, 
    Plus,
    Users,
    TrendingUp
} from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";
import TicketList from "../components/dashboard/TicketList";
import TicketFilters from "../components/dashboard/TicketFilters";
import TicketDetails from "../components/dashboard/TicketDetails";

export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        priority: "all",
        category: "all"
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tickets, filters]);

    const loadTickets = async () => {
        setIsLoading(true);
        try {
            const data = await SupportTicket.list("-created_date");
            setTickets(data);
        } catch (error) {
            console.error("Error loading tickets:", error);
        }
        setIsLoading(false);
    };

    const applyFilters = () => {
        let filtered = tickets;

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(ticket =>
                ticket.title.toLowerCase().includes(searchTerm) ||
                ticket.description.toLowerCase().includes(searchTerm) ||
                ticket.requester_name.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.status && filters.status !== "all") {
            filtered = filtered.filter(ticket => ticket.status === filters.status);
        }

        if (filters.priority && filters.priority !== "all") {
            filtered = filtered.filter(ticket => ticket.priority === filters.priority);
        }

        if (filters.category && filters.category !== "all") {
            filtered = filtered.filter(ticket => ticket.category === filters.category);
        }

        setFilteredTickets(filtered);
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            priority: "all",
            category: "all"
        });
    };

    const getStats = () => {
        const openTickets = tickets.filter(t => t.status === 'open').length;
        const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
        const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
        const resolvedToday = tickets.filter(t => {
            const today = new Date().toDateString();
            return t.status === 'resolved' && new Date(t.updated_date).toDateString() === today;
        }).length;

        return { openTickets, inProgressTickets, urgentTickets, resolvedToday };
    };

    const stats = getStats();

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--neutral-50)' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Support Ticket Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Manage and track all technology support requests
                        </p>
                    </div>
                    <Link to={createPageUrl("CreateTicket")}>
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                            size="lg"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Ticket
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Open Tickets"
                        value={stats.openTickets}
                        icon={Ticket}
                        color="#3b82f6"
                        description="Awaiting response"
                    />
                    <StatsCard
                        title="In Progress"
                        value={stats.inProgressTickets}
                        icon={Clock}
                        color="#f59e0b"
                        description="Being worked on"
                    />
                    <StatsCard
                        title="Urgent Priority"
                        value={stats.urgentTickets}
                        icon={AlertTriangle}
                        color="#ef4444"
                        description="Require immediate attention"
                    />
                    <StatsCard
                        title="Resolved Today"
                        value={stats.resolvedToday}
                        icon={CheckCircle}
                        color="#10b981"
                        description="Completed tickets"
                    />
                </div>

                <TicketFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                />

                <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border-0 shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Tickets ({filteredTickets.length})
                            </h2>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <TicketList
                                    tickets={filteredTickets}
                                    onSelectTicket={setSelectedTicket}
                                    selectedTicket={selectedTicket}
                                />
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <TicketDetails
                            ticket={selectedTicket}
                            onTicketUpdate={loadTickets}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
