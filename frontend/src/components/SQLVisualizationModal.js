import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const SQLVisualizationModal = ({ isOpen, onClose, operation, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateSQL = () => {
    if (!operation || !data) return '-- No SQL generated';

    switch (operation) {
      case 'CREATE_MEMBER':
        return `-- Create a new member
INSERT INTO members (
    first_name,
    last_name,
    email,
    phone,
    address,
    membership_type,
    password_hash,
    password_changed,
    status,
    membership_date
)
VALUES (
    '${data.first_name || ''}',
    '${data.last_name || ''}',
    '${data.email || ''}',
    ${data.phone ? `'${data.phone}'` : 'NULL'},
    ${data.address ? `'${data.address}'` : 'NULL'},
    '${data.membership_type || 'STUDENT'}',
    '${data.password_hash || '<GENERATED_PASSWORD_HASH>'}',
    0,
    'ACTIVE',
    SYSDATE
);

COMMIT;`;

      case 'UPDATE_MEMBER':
        return `-- Update member information
UPDATE members
SET
    first_name = '${data.first_name || ''}',
    last_name = '${data.last_name || ''}',
    email = '${data.email || ''}',
    phone = ${data.phone ? `'${data.phone}'` : 'NULL'},
    address = ${data.address ? `'${data.address}'` : 'NULL'},
    membership_type = '${data.membership_type || 'STUDENT'}',
    status = '${data.status || 'ACTIVE'}',
    updated_at = CURRENT_TIMESTAMP
WHERE member_id = ${data.id || '<MEMBER_ID>'};

COMMIT;`;

      case 'DELETE_MEMBER':
        return `-- Delete a member (only if no active transactions)
-- First, check for active transactions
SELECT COUNT(*) as active_transactions
FROM transactions
WHERE member_id = ${data.id || '<MEMBER_ID>'}
  AND status IN ('ISSUED', 'OVERDUE');

-- If no active transactions, proceed with deletion
DELETE FROM members
WHERE member_id = ${data.id || '<MEMBER_ID>'};

COMMIT;`;

      case 'CREATE_BOOK':
        return `-- Create a new book
INSERT INTO books (
    isbn,
    title,
    author,
    publisher,
    publication_year,
    category,
    total_copies,
    available_copies,
    price,
    description,
    status
)
VALUES (
    ${data.isbn ? `'${data.isbn}'` : 'NULL'},
    '${data.title || ''}',
    '${data.author || ''}',
    ${data.publisher ? `'${data.publisher}'` : 'NULL'},
    ${data.publication_year || 'NULL'},
    ${data.category ? `'${data.category}'` : 'NULL'},
    ${data.total_copies || 1},
    ${data.total_copies || 1},
    ${data.price || 'NULL'},
    ${data.description ? `'${data.description.replace(/'/g, "''")}'` : 'NULL'},
    'AVAILABLE'
);

COMMIT;`;

      case 'UPDATE_BOOK':
        return `-- Update book information
UPDATE books
SET
    isbn = ${data.isbn ? `'${data.isbn}'` : 'NULL'},
    title = '${data.title || ''}',
    author = '${data.author || ''}',
    publisher = ${data.publisher ? `'${data.publisher}'` : 'NULL'},
    publication_year = ${data.publication_year || 'NULL'},
    category = ${data.category ? `'${data.category}'` : 'NULL'},
    total_copies = ${data.total_copies || 1},
    available_copies = ${data.available_copies || data.total_copies || 1},
    price = ${data.price || 'NULL'},
    description = ${data.description ? `'${data.description.replace(/'/g, "''")}'` : 'NULL'},
    status = '${data.status || 'AVAILABLE'}',
    updated_at = CURRENT_TIMESTAMP
WHERE book_id = ${data.id || '<BOOK_ID>'};

COMMIT;`;

      case 'DELETE_BOOK':
        return `-- Delete a book (only if no active transactions)
-- First, check for active transactions
SELECT COUNT(*) as active_transactions
FROM transactions
WHERE book_id = ${data.id || '<BOOK_ID>'}
  AND status IN ('ISSUED', 'OVERDUE');

-- If no active transactions, proceed with deletion
DELETE FROM books
WHERE book_id = ${data.id || '<BOOK_ID>'};

COMMIT;`;

      case 'ISSUE_BOOK':
        return `-- Issue a book to a member
-- Step 1: Check if member exists and is active
SELECT member_id, status
FROM members
WHERE member_id = ${data.member_id || '<MEMBER_ID>'};

-- Step 2: Check if book exists and is available
SELECT book_id, available_copies, status
FROM books
WHERE book_id = ${data.book_id || '<BOOK_ID>'};

-- Step 3: Check if member already has this book
SELECT transaction_id
FROM transactions
WHERE member_id = ${data.member_id || '<MEMBER_ID>'}
  AND book_id = ${data.book_id || '<BOOK_ID>'}
  AND status = 'ISSUED';

-- Step 4: Create transaction record
INSERT INTO transactions (
    member_id,
    book_id,
    issue_date,
    due_date,
    status
)
VALUES (
    ${data.member_id || '<MEMBER_ID>'},
    ${data.book_id || '<BOOK_ID>'},
    SYSDATE,
    TO_DATE('${data.due_date || '2024-12-31'}', 'YYYY-MM-DD'),
    'ISSUED'
);

-- Step 5: Update book available copies
UPDATE books
SET available_copies = available_copies - 1
WHERE book_id = ${data.book_id || '<BOOK_ID>'};

COMMIT;`;

      case 'RETURN_BOOK':
        return `-- Return a book
-- Step 1: Get transaction details
SELECT transaction_id, member_id, book_id, issue_date, due_date, status
FROM transactions
WHERE transaction_id = ${data.transaction_id || '<TRANSACTION_ID>'};

-- Step 2: Calculate fine if overdue
-- (This calculation is done in application logic)
-- Fine amount = days_overdue * 1 (if return_date > due_date)

-- Step 3: Update transaction
UPDATE transactions
SET
    return_date = SYSDATE,
    fine_amount = ${data.fine_amount || 0},
    status = 'RETURNED',
    updated_at = CURRENT_TIMESTAMP
WHERE transaction_id = ${data.transaction_id || '<TRANSACTION_ID>'};

-- Step 4: Update book available copies
UPDATE books
SET available_copies = available_copies + 1
WHERE book_id = (SELECT book_id FROM transactions WHERE transaction_id = ${data.transaction_id || '<TRANSACTION_ID>'});

-- Step 5: Create fine record if applicable
${data.fine_amount > 0 ? `INSERT INTO fine_history (
    transaction_id,
    member_id,
    fine_amount,
    fine_reason,
    status
)
VALUES (
    ${data.transaction_id || '<TRANSACTION_ID>'},
    (SELECT member_id FROM transactions WHERE transaction_id = ${data.transaction_id || '<TRANSACTION_ID>'}),
    ${data.fine_amount || 0},
    'Late return',
    'PENDING'
);` : '-- No fine applicable'}

COMMIT;`;

      case 'RENEW_BOOK':
        return `-- Renew a book (extend due date)
-- Step 1: Get current transaction details
SELECT transaction_id, member_id, book_id, due_date, status
FROM transactions
WHERE transaction_id = ${data.transaction_id || '<TRANSACTION_ID>'};

-- Step 2: Calculate new due date
-- New due date = current due date + ${data.extension_days || 14} days

-- Step 3: Update transaction with new due date
UPDATE transactions
SET
    due_date = due_date + ${data.extension_days || 14},
    status = CASE
        WHEN due_date + ${data.extension_days || 14} < SYSDATE THEN 'OVERDUE'
        ELSE 'ISSUED'
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE transaction_id = ${data.transaction_id || '<TRANSACTION_ID>'};

COMMIT;`;

      default:
        return '-- Unknown operation';
    }
  };

  const sqlCode = generateSQL();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    toast.success('SQL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getOperationTitle = () => {
    const titles = {
      CREATE_MEMBER: 'Create Member',
      UPDATE_MEMBER: 'Update Member',
      DELETE_MEMBER: 'Delete Member',
      CREATE_BOOK: 'Create Book',
      UPDATE_BOOK: 'Update Book',
      DELETE_BOOK: 'Delete Book',
      ISSUE_BOOK: 'Issue Book',
      RETURN_BOOK: 'Return Book',
      RENEW_BOOK: 'Renew Book'
    };
    return titles[operation] || 'SQL Visualization';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {getOperationTitle()} - Oracle SQL Code
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The following Oracle SQL code represents the database transaction that will be executed when you perform this operation:
              </p>
            </div>

            {/* SQL Code Block */}
            <div className="relative">
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                title="Copy SQL"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{sqlCode}</code>
              </pre>
            </div>

            {/* Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This SQL code is generated based on the current form values. 
                Replace placeholder values (like &lt;MEMBER_ID&gt;, &lt;BOOK_ID&gt;) with actual values when executing in SQL Developer.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLVisualizationModal;

