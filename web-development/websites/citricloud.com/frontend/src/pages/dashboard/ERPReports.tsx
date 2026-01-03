import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiPieChart, FiTrendingUp, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ERPReports() {
  const [dateRange, setDateRange] = useState('this_month');
  const [reportType, setReportType] = useState('financial');
  const queryClient = useQueryClient();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await erpAPI.getReports({ page: 1, page_size: 10 });
      return response.data;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await erpAPI.generateReport({
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type: reportType,
        parameters: { date_range: dateRange }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate report');
    }
  });

  const reports = reportsData?.items || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Report Generation Panel */}
      <div className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Generate Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
            <div className="relative">
              <FiPieChart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="financial">Financial Summary</option>
                <option value="sales">Sales Analysis</option>
                <option value="inventory">Inventory Status</option>
                <option value="suppliers">Supplier Performance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {generateReportMutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiTrendingUp />
                  <span>Generate Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports List */}
      <div className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Reports</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Report Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Date Generated</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Data Summary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No reports generated yet.
                    </td>
                  </tr>
                ) : (
                  reports.map((report: any) => (
                    <tr key={report.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FiFileText />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-100">{report.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                          {report.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                        {JSON.stringify(report.data)}
                      </td>
                      <td className="py-3 px-4">
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                          <FiDownload className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}