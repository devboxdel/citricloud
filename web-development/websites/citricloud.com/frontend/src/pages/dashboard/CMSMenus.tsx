import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { cmsAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiMenu, FiPlus, FiEdit, FiTrash2, FiChevronRight } from 'react-icons/fi';

export default function CMSMenus() {
  const { data: menus, isLoading } = useQuery({
    queryKey: ['cms-menus'],
    queryFn: async () => {
      const response = await cmsAPI.getMenus();
      return response.data;
    },
  });

  const getItemChildren = (items: any[], parentId: number | null) => {
    return items?.filter((item: any) => item.parent_id === parentId).sort((a: any, b: any) => a.order_index - b.order_index) || [];
  };

  return (
    <DashboardLayout
      title="Menus"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Menus</div>}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Navigation Menus</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your website navigation structure
          </p>
        </div>
        <button className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Create Menu
        </button>
      </div>

      {/* Menus List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {menus?.map((menu: any, index: number) => {
            const topLevelItems = getItemChildren(menu.menu_items, null);
            
            return (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white">
                      <FiMenu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">{menu.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{menu.slug}</p>
                        {menu.location && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {menu.location}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          menu.is_active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                          {menu.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" title="Edit">
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                {topLevelItems.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    {topLevelItems.map((item: any) => {
                      const children = getItemChildren(menu.menu_items, item.id);
                      return (
                        <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FiChevronRight className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800 dark:text-gray-100">{item.title}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">→ {item.url}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Order: {item.order_index}</span>
                          </div>
                          {children.length > 0 && (
                            <div className="ml-6 mt-2 space-y-1">
                              {children.map((child: any) => (
                                <div key={child.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <FiChevronRight className="w-3 h-3" />
                                  <span>{child.title}</span>
                                  <span className="text-xs">→ {child.url}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No menu items yet
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && (!menus || menus.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <FiMenu className="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No menus yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Create your first menu to manage site navigation</p>
          <button className="glass-button px-8 py-3 rounded-xl text-white font-medium inline-flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Create Menu
          </button>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
