import React, { useState } from 'react';

const MentionsList = ({ onMention }) => {
  const [mentionUsers] = useState([
    { id: 'john', name: 'John Doe', email: 'john@company.com' },
    { id: 'jane', name: 'Jane Smith', email: 'jane@company.com' },
    { id: 'bob', name: 'Bob Johnson', email: 'bob@company.com' },
    { id: 'alice', name: 'Alice Williams', email: 'alice@company.com' }
  ]);

  return (
    <div className="border border-stone-200 rounded-lg p-2 bg-white shadow-lg max-h-48 overflow-y-auto">
      {mentionUsers.map(user => (
        <div
          key={user.id}
          onClick={() => onMention(`@${user.name}`)}
          className="p-2 hover:bg-stone-100 rounded cursor-pointer flex items-center space-x-2"
        >
          <div className="h-8 w-8 bg-sage-100 rounded-full flex items-center justify-center">
            <span className="text-sage-700 text-xs font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">{user.name}</p>
            <p className="text-xs text-stone-500">{user.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MentionsList;


