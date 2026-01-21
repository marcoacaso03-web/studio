import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMatches } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PartitePage() {
  const matches = getMatches();

  const getStatusBadge = (status: 'scheduled' | 'completed' | 'canceled') => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completata</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">In Programma</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Annullata</Badge>;
      default:
        return <Badge variant="outline">N/D</Badge>;
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendario Partite</CardTitle>
            <CardDescription>Visualizza e gestisci tutte le partite della stagione.</CardDescription>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Aggiungi Partita
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Avversario</TableHead>
              <TableHead>Luogo</TableHead>
              <TableHead>Risultato</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>
                <span className="sr-only">Azioni</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="font-medium">
                  {new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell>{match.opponent}</TableCell>
                <TableCell>{match.location} {match.isHome ? '(C)' : '(T)'}</TableCell>
                <TableCell>
                  {match.result ? `${match.result.home} - ${match.result.away}` : '-'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(match.status)}
                </TableCell>
                <TableCell>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button asChild variant="ghost" className="h-8 w-8 p-0">
                        <Link href={`/partita/${match.id}`}><MoreHorizontal className="h-4 w-4" /></Link>
                      </Button>
                    </DropdownMenuTrigger>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
