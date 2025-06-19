import React from 'react'

interface TableProps {
  className?: string
  children: React.ReactNode
}

export function Table({ className = '', children }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className = '', children }: TableProps) {
  return (
    <thead className={`[&_tr]:border-b border-gray-700 ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ className = '', children }: TableProps) {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`}>
      {children}
    </tbody>
  )
}

export function TableFooter({ className = '', children }: TableProps) {
  return (
    <tfoot className={`bg-gray-800 font-medium [&>tr]:last:border-b-0 ${className}`}>
      {children}
    </tfoot>
  )
}

export function TableRow({ className = '', children }: TableProps) {
  return (
    <tr className={`border-b border-gray-700 transition-colors hover:bg-gray-800/50 data-[state=selected]:bg-gray-800 ${className}`}>
      {children}
    </tr>
  )
}

export function TableHead({ className = '', children }: TableProps) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-gray-300 [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </th>
  )
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string
  children: React.ReactNode
}

export function TableCell({ className = '', children, ...props }: TableCellProps) {
  return (
    <td className={`p-4 align-middle text-white [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
      {children}
    </td>
  )
}
