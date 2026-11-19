import { Link } from "react-router-dom";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import { listClients, listProjects } from "../../../lib/billingData";
import {
  Card,
  CardTitle,
  ErrorText,
  Muted,
  StatusBadge,
  Table,
} from "../../../components/billing/billingStyles";

export function AdminProjects() {
  const { data, error, loading } = useAsyncLoad(async () => {
    const [projects, clients] = await Promise.all([
      listProjects(),
      listClients(),
    ]);
    return { projects, clients };
  }, []);

  if (loading) return <Muted>Loading projects…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return null;

  const clientName = (clientId: string) =>
    String(data.clients.find((c) => c.id === clientId)?.name ?? clientId);

  return (
    <Card>
      <CardTitle>Projects</CardTitle>
      {data.projects.length === 0 ? (
        <Muted>
          No projects. Create one from a{" "}
          <Link to="/admin/clients">client detail</Link> page.
        </Muted>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Client</th>
              <th>Status</th>
              <th>Slug</th>
            </tr>
          </thead>
          <tbody>
            {data.projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/admin/projects/${p.id}`}>{String(p.name)}</Link>
                </td>
                <td>
                  <Link to={`/admin/clients/${String(p.clientId)}`}>
                    {clientName(String(p.clientId))}
                  </Link>
                </td>
                <td>
                  <StatusBadge
                    $tone={
                      p.status === "active"
                        ? "ok"
                        : p.status === "paused"
                          ? "warn"
                          : "neutral"
                    }
                  >
                    {String(p.status)}
                  </StatusBadge>
                </td>
                <td>
                  <code>{String(p.slug)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
