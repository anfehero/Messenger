import getCurrentUser from "@/app/actions/getCurrentUser"
import prisma from "@/app/libs/prismadb"
import { pusherServer } from "@/app/libs/pusher"
import { NextResponse } from "next/server"

interface IParams {
  conversationId?: string
}

export async function POST(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser()

    const {
      conversationId
    } = params

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    //Find the existing conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        messages: {
          include: {
            seen: true
          }
        },
        users: true
      }
    })

    if (!conversation) {
      return new NextResponse('Invalid ID', { status: 400 })
    }

    //Find the last message
    const lastMassage = conversation.messages[conversation.messages.length - 1]

    if (!lastMassage) {
      return NextResponse.json(conversation)
    }

    //update seen of last message
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMassage.id
      },
      include: {
        sender: true,
        seen: true
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id
          }
        }
      }
    })

    await pusherServer.trigger(currentUser.email, 'conversation:update', {
      id: conversationId,
      messages: [updatedMessage]
    })

    if (lastMassage.seenIds.indexOf(currentUser.id) !== - 1) {
      return NextResponse.json(conversation)
    }

    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage)
    

    return NextResponse.json(updatedMessage)

  } catch (error: any) {
    console.log(error, 'ERROR_MESSAGES_SEEN')
    return new NextResponse('Internal Error', { status: 500 })
  }
}