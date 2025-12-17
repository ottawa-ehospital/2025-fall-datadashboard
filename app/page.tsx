"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">eHospital System</CardTitle>
          <CardDescription className="text-lg mt-2">Canadian Electronic Hospital Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">Select your role to access the dashboard</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/patient">
              <Button variant="default" className="w-full h-12 text-lg">
                Patient Dashboard
              </Button>
            </Link>
            <Link href="/doctor">
              <Button variant="default" className="w-full h-12 text-lg">
                Doctor Dashboard
              </Button>
            </Link>
            <Link href="/analyst">
              <Button variant="default" className="w-full h-12 text-lg">
                System Analyst Dashboard
              </Button>
            </Link>
            <Link href="/clinical_staff">
              <Button variant="default" className="w-full h-12 text-lg">
                Clinical Staff Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
