import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAsyncLoad } from "../../../hooks/useAsyncLoad";
import {
  getProject,
  listServices,
  listSubscriptions,
} from "../../../lib/billingData";
import {
  adminUpsertProject,
  adminUpsertService,
  adminArchiveProject,
  adminNotifyProjectBillingAccess,
  callableErrorMessage,
} from "../../../lib/billingApi";
import { formatMoney, formatDate } from "../../../lib/billingFormat";
import {
  Card,
  CardTitle,
  ErrorText,
  Form,
  FormRow,
  Input,
  Label,
  Muted,
  PrimaryButton,
  SecondaryButton,
  Select,
  Table,
  TextArea,
} from "../../../components/billing/billingStyles";

export function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useAsyncLoad(async () => {
    if (!id) return null;
    const project = await getProject(id);
    if (!project) return null;
    const [services, subscriptions] = await Promise.all([
      listServices(String(project.clientId)),
      listSubscriptions(String(project.clientId)),
    ]);
    return {
      project,
      services: services.filter((s) => s.projectId === id),
      subscriptions: subscriptions.filter((s) => s.projectId === id),
    };
  }, [id]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"active" | "paused" | "archived">(
    "active"
  );
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [svcName, setSvcName] = useState("");
  const [svcAmount, setSvcAmount] = useState("1500");
  const [svcStarts, setSvcStarts] = useState("2027-01-01");

  useEffect(() => {
    if (!data?.project) return;
    setName(String(data.project.name ?? ""));
    setSlug(String(data.project.slug ?? ""));
    setStatus(
      (data.project.status as "active" | "paused" | "archived") ?? "active"
    );
    setDescription(String(data.project.description ?? ""));
  }, [data?.project]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!data?.project) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await adminUpsertProject({
        projectId: data.project.id,
        clientId: String(data.project.clientId),
        name: name.trim(),
        slug: slug.trim(),
        status,
        description: description.trim() || undefined,
      });
      setMsg("Project updated");
      reload();
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusy(false);
    }
  };

  const onArchive = async () => {
    if (!id) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await adminArchiveProject({ projectId: id });
      setMsg("Project archived");
      reload();
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusy(false);
    }
  };

  const onAddService = async (e: FormEvent) => {
    e.preventDefault();
    if (!data?.project) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const amountCents = Math.round(Number(svcAmount) * 100);
      const res = await adminUpsertService({
        clientId: String(data.project.clientId),
        projectId: data.project.id,
        name: svcName.trim(),
        amountCents,
        interval: "month",
        active: true,
        startsAtIso: new Date(`${svcStarts}T00:00:00.000Z`).toISOString(),
      });
      setMsg(`Service ${res.serviceId} created`);
      setSvcName("");
      reload();
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusy(false);
    }
  };

  const onNotify = async (accessState: "active" | "suspended") => {
    if (!id) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await adminNotifyProjectBillingAccess({
        projectId: id,
        accessState,
        reason: "admin_portal_manual",
      });
      setMsg(
        `S2S notify ${accessState}: dryRun=${String(res.dryRun)} notified=${String(res.notified)}`
      );
    } catch (error_) {
      setErr(callableErrorMessage(error_));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Muted>Loading project…</Muted>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data?.project) return <Muted>Project not found.</Muted>;

  return (
    <>
      <Muted>
        <Link to="/admin/projects">← Projects</Link>
        {" · "}
        <Link to={`/admin/clients/${String(data.project.clientId)}`}>
          Client
        </Link>
      </Muted>

      <Card>
        <CardTitle>{String(data.project.name)}</CardTitle>
        <Form onSubmit={onSave}>
          <Label>
            Name
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Slug
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Status
            <Select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "active" | "paused" | "archived")
              }
              disabled={busy}
            >
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="archived">archived</option>
            </Select>
          </Label>
          <Label>
            Description
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
            />
          </Label>
          <FormRow>
            <PrimaryButton type="submit" disabled={busy}>
              Save project
            </PrimaryButton>
            <SecondaryButton
              type="button"
              disabled={busy || status === "archived"}
              onClick={() => void onArchive()}
            >
              Archive
            </SecondaryButton>
          </FormRow>
        </Form>
      </Card>

      <Card>
        <CardTitle>Services</CardTitle>
        {data.services.length === 0 ? (
          <Muted>No services on this project.</Muted>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Starts</th>
                <th>Stripe price</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((s) => (
                <tr key={s.id}>
                  <td>{String(s.name)}</td>
                  <td>
                    {formatMoney(
                      Number(s.amountCents),
                      String(s.currency ?? "usd")
                    )}
                    /{String(s.interval)}
                  </td>
                  <td>{formatDate(s.startsAt as never)}</td>
                  <td>
                    <code style={{ fontSize: "0.8rem" }}>
                      {String(s.stripePriceId ?? "—")}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Form onSubmit={onAddService}>
          <Label>
            Service name
            <Input
              value={svcName}
              onChange={(e) => setSvcName(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Amount (USD / month)
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={svcAmount}
              onChange={(e) => setSvcAmount(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <Label>
            Starts (UTC date)
            <Input
              type="date"
              value={svcStarts}
              onChange={(e) => setSvcStarts(e.target.value)}
              required
              disabled={busy}
            />
          </Label>
          <PrimaryButton type="submit" disabled={busy}>
            Add service
          </PrimaryButton>
        </Form>
        <Muted style={{ marginTop: "0.75rem" }}>
          Stripe Product/Price ids are set by seed / enrollment — this form
          stores Firestore service metadata.
        </Muted>
      </Card>

      <Card>
        <CardTitle>Codex S2S (manual)</CardTitle>
        <Muted>
          Dry-run by default. Do not suspend production Codex until approved.
        </Muted>
        <FormRow style={{ marginTop: "1rem" }}>
          <PrimaryButton
            type="button"
            disabled={busy}
            onClick={() => void onNotify("active")}
          >
            Notify active
          </PrimaryButton>
          <SecondaryButton
            type="button"
            disabled={busy}
            onClick={() => void onNotify("suspended")}
          >
            Notify suspended
          </SecondaryButton>
        </FormRow>
      </Card>

      <Card>
        <CardTitle>Subscriptions on project</CardTitle>
        <Muted>{data.subscriptions.length} subscription doc(s)</Muted>
      </Card>

      {err && <ErrorText>{err}</ErrorText>}
      {msg && <Muted style={{ marginTop: "0.75rem" }}>{msg}</Muted>}
    </>
  );
}
