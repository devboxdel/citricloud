import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Operator {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  is_active: boolean;
}

interface OperatorsContextType {
  operators: Operator[];
  addOperator: (operator: Omit<Operator, 'id'>) => void;
  updateOperator: (id: number, updates: Partial<Operator>) => void;
  deleteOperator: (id: number) => void;
  getOnlineOperators: () => Operator[];
}

const OperatorsContext = createContext<OperatorsContextType | undefined>(undefined);

const DEFAULT_OPERATORS: Operator[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@citricloud.com',
    phone: '+1 (555) 123-4567',
    status: 'online',
    is_active: true,
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@citricloud.com',
    phone: '+1 (555) 234-5678',
    status: 'online',
    is_active: true,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily@citricloud.com',
    phone: '+1 (555) 345-6789',
    status: 'away',
    is_active: true,
  },
];

export function OperatorsProvider({ children }: { children: ReactNode }) {
  const [operators, setOperators] = useState<Operator[]>(() => {
    const stored = localStorage.getItem('chat-operators');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_OPERATORS;
      }
    }
    return DEFAULT_OPERATORS;
  });

  useEffect(() => {
    localStorage.setItem('chat-operators', JSON.stringify(operators));
  }, [operators]);

  const addOperator = (operator: Omit<Operator, 'id'>) => {
    const newOperator = {
      ...operator,
      id: Math.max(0, ...operators.map(o => o.id)) + 1,
    };
    setOperators(prev => [...prev, newOperator]);
  };

  const updateOperator = (id: number, updates: Partial<Operator>) => {
    setOperators(prev =>
      prev.map(operator =>
        operator.id === id ? { ...operator, ...updates } : operator
      )
    );
  };

  const deleteOperator = (id: number) => {
    setOperators(prev => prev.filter(operator => operator.id !== id));
  };

  const getOnlineOperators = () => {
    return operators.filter(op => op.is_active && op.status === 'online');
  };

  return (
    <OperatorsContext.Provider
      value={{
        operators,
        addOperator,
        updateOperator,
        deleteOperator,
        getOnlineOperators,
      }}
    >
      {children}
    </OperatorsContext.Provider>
  );
}

export function useOperators() {
  const context = useContext(OperatorsContext);
  if (!context) {
    throw new Error('useOperators must be used within OperatorsProvider');
  }
  return context;
}
