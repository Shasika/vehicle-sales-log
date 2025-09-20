import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/models';
import { formatCurrencyWithRs } from '@/lib/currency';

async function getRecentActivity() {
  await connectDB();

  const recentTransactions = await Transaction.find({ 
    deletedAt: { $exists: false } 
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('vehicleId', 'registrationNumber make vehicleModel')
    .populate('counterpartyId', 'fullName businessName type')
    .lean();

  return recentTransactions;
}

export default async function RecentActivity() {
  const transactions = await getRecentActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              No recent transactions
            </p>
          ) : (
            transactions.map((transaction) => {
              const vehicle = transaction.vehicleId as any;
              const counterparty = transaction.counterpartyId as any;
              const isAcquisition = transaction.direction === 'IN';

              return (
                <div
                  key={transaction._id.toString()}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      isAcquisition 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {isAcquisition ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {isAcquisition ? 'Acquired' : 'Sold'}
                        </span>
                        <Badge variant={isAcquisition ? 'info' : 'success'}>
                          {vehicle?.registrationNumber}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {vehicle?.make} {vehicle?.vehicleModel} • {
                          counterparty?.type === 'Individual' 
                            ? counterparty?.fullName 
                            : counterparty?.businessName
                        }
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${
                      isAcquisition ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isAcquisition ? '-' : '+'}{formatCurrencyWithRs(transaction.totalPrice)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {transactions.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <a
              href="/transactions"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View all transactions →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}