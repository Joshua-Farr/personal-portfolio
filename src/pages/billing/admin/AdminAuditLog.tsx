import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import { listAuditLog } from "../../../lib/billingData";
import { formatDate } from "../../../lib/billingFormat";
import {
  Card,
  CardTitle,
  ErrorText,
  Muted,
  Table,
} from "../../../components/billing/billingStyles";

export function AdminAuditLog() {
  const { data, error, loading } = useAsyncLoad(() => listAuditLog(100), []);

  if (loading) return <Muted>Loading audit log…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <Card>
      <CardTitle>Audit log</CardTitle>
      <Muted>
        Admin (and some portal) actions written via Cloud Functions. Read-only
        here — clients cannot see this collection.
      </Muted>
      {!data || data.length === 0 ? (
        <Muted style={{ marginTop: "1rem" }}>No audit entries yet.</Muted>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Target</th>
              <th>Actor</th>
              <th>Meta</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.createdAt as never)}</td>
                <td>
                  <code>{String(row.action)}</code>
                </td>
                <td>
                  {String(row.targetType)} /{" "}
                  <code style={{ fontSize: "0.8rem" }}>
                    {String(row.targetId)}
                  </code>
                </td>
                <td>
                  <code style={{ fontSize: "0.8rem" }}>
                    {String(row.actorUid)}
                  </code>
                </td>
                <td>
                  <Muted style={{ margin: 0, fontSize: "0.8rem" }}>
                    {row.meta
                      ? JSON.stringify(row.meta).slice(0, 120)
                      : "—"}
                  </Muted>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
