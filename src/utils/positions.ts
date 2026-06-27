// Create src/utils/positions.ts
export const EXECUTIVE_POSITIONS = [
    "President",
    "Vice President",
    "General Secretary",
    "Assistant General Secretary",
    "Treasurer",
    "Public Relations Officer",
    "Sports Director",
    "Assistant Sports Director",
    "Social Director",
    "Financial Secretary",
    "Undergraduate Coordinator",
    "Electoral Chairman",
    "System Administrator",
    "Electoral Committee",
    "Social Committee",
    "Executive Member"
  ] as const;
  
  export type ExecutivePosition = typeof EXECUTIVE_POSITIONS[number];
  
  export const getPositionBadgeColor = (position: string): string => {
    const colors: Record<string, string> = {
      'President': 'bg-gradient-to-r from-purple-500 to-purple-700 text-white',
      'Vice President': 'bg-gradient-to-r from-blue-500 to-blue-700 text-white',
      'General Secretary': 'bg-gradient-to-r from-green-500 to-green-700 text-white',
      'Assistant General Secretary': 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white',
      'Treasurer': 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white',
      'Financial Secretary': 'bg-gradient-to-r from-amber-500 to-amber-700 text-white',
      'Public Relations Officer': 'bg-gradient-to-r from-pink-500 to-pink-700 text-white',
      'Sports Director': 'bg-gradient-to-r from-red-500 to-red-700 text-white',
      'Assistant Sports Director': 'bg-gradient-to-r from-orange-500 to-orange-700 text-white',
      'Social Director': 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white',
      'Undergraduate Coordinator': 'bg-gradient-to-r from-teal-500 to-teal-700 text-white',
      'Electoral Chairman': 'bg-gradient-to-r from-violet-500 to-violet-700 text-white',
      'System Administrator': 'bg-gradient-to-r from-slate-500 to-slate-700 text-white',
      'Electoral Committee': 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white',
      'Social Committee': 'bg-gradient-to-r from-rose-500 to-pink-700 text-white',
      'Executive Member': 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
    };
    return colors[position] || 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
  };
  
  export const getPositionIcon = (position: string): string => {
    const icons: Record<string, string> = {
      'President': '👑',
      'Vice President': '🤝',
      'General Secretary': '📋',
      'Assistant General Secretary': '📝',
      'Treasurer': '💰',
      'Financial Secretary': '💳',
      'Public Relations Officer': '📢',
      'Sports Director': '⚽',
      'Assistant Sports Director': '🏃',
      'Social Director': '🎉',
      'Undergraduate Coordinator': '🎓',
      'Electoral Chairman': '🗳',
      'System Administrator': '⚙️',
      'Electoral Committee': '📋',
      'Social Committee': '🎊',
      'Executive Member': '👤'
    };
    return icons[position] || '👤';
  };