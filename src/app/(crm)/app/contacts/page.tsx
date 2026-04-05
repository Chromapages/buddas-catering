"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { getAllContacts } from "@/lib/firebase/services/contact.service";
import { Contact } from "@/types/crm";

type SortField = "name" | "role" | "company" | "date";
type SortOrder = "asc" | "desc";

const CONTACT_ROLES = ["All", "Decision Maker", "Influencer", "Technical", "Billing", "Other"];

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const data = await getAllContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      (contact.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (contact.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (contact.companyName || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || contact.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let result = 0;
    if (sortField === "name") result = (a.fullName || "").localeCompare(b.fullName || "");
    if (sortField === "role") result = (a.role || "").localeCompare(b.role || "");
    if (sortField === "company") result = (a.companyName || "").localeCompare(b.companyName || "");
    if (sortField === "date") {
      const dateA = (a.createdAt as any)?.seconds ?? 0;
      const dateB = (b.createdAt as any)?.seconds ?? 0;
      result = dateA - dateB;
    }
    return sortOrder === "asc" ? result : -result;
  });

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-brown/30 ml-1 inline-block" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-teal-dark ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-4 h-4 text-teal-dark ml-1 inline-block" />
    );
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark">Contacts</h1>
          <p className="text-sm text-brown/70 mt-1">Direct directory of all client stakeholders and decision makers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brown/40" />
          <Input
            placeholder="Search name, email or company..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brown/60" />
          <select
            className="text-sm border-gray-border rounded-md px-3 py-2 bg-gray-bg focus:ring-teal-base focus:border-teal-base appearance-none pr-8 relative"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {CONTACT_ROLES.map((role) => (
              <option key={role} value={role}>
                {role === "All" ? "All Roles" : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-gray-border rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-bg border-b border-gray-border text-brown/70 font-medium">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Contact <SortIcon field="name" />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("company")}
                >
                  Company <SortIcon field="company" />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("role")}
                >
                  Role <SortIcon field="role" />
                </th>
                <th className="px-6 py-4">Status</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort("date")}
                >
                  Added <SortIcon field="date" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-border text-brown">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-brown/50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-base border-t-transparent"></div>
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-bg/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/app/contacts/${contact.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-dark/10 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 text-teal-dark" />
                        </div>
                        <div>
                          <div className="font-semibold">{contact.name || "Unnamed Contact"}</div>
                          <div className="flex items-center gap-2 text-xs text-brown/50">
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {contact.email}
                              </span>
                            )}
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-brown/70">
                            <Building2 className="w-3 h-3 text-brown/30" />
                            {contact.companyName || "—"}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-brown/70">{contact.role || "—"}</td>
                    <td className="px-6 py-4">
                      {contact.isPrimary ? (
                        <Badge variant="success">Primary</Badge>
                      ) : (
                        <Badge variant="neutral">Stakeholder</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-brown/70">
                      {(contact.createdAt as any)?.seconds
                        ? format((contact.createdAt as any).seconds * 1000, "MMM d, yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-brown/50">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-auto px-6 py-4 border-t border-gray-border bg-gray-bg/30 flex items-center justify-between">
          <p className="text-sm text-brown/60">
            Showing{" "}
            <span className="font-medium text-brown">
              {filteredContacts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-brown">
              {Math.min(currentPage * itemsPerPage, filteredContacts.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-brown">{filteredContacts.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm font-medium text-brown px-2">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
