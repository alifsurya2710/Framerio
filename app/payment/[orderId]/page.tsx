import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import PaymentClient from '@/components/PaymentClient'

export default async function PaymentPage({ params }: { params: { orderId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const sub = await prisma.subscription.findUnique({ where: { orderId: params.orderId } })
  if (!sub || sub.userId !== session.user.id) redirect('/pricing')

  return <PaymentClient sub={JSON.parse(JSON.stringify(sub))} />
}