import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest): NextResponse | null {
    const { pathname, origin } = req.nextUrl
    if (pathname == '/')
        return NextResponse.rewrite(`${origin}/first-page`)
    return NextResponse.next()
}