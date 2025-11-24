gcloud secrets create SUPABASE_URL --replication-policy=automatic
gcloud secrets create SUPABASE_ANON_KEY --replication-policy=automatic
gcloud secrets create NEXT_PUBLIC_SUPABASE_URL --replication-policy=automatic
gcloud secrets create NEXT_PUBLIC_SUPABASE_ANON_KEY --replication-policy=automatic
gcloud secrets create NEXT_PUBLIC_BASE_URL --replication-policy=automatic

gcloud secrets add-iam-policy-binding SUPABASE_URL --member=serviceAccount:666446126828-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor
gcloud secrets add-iam-policy-binding SUPABASE_ANON_KEY --member=serviceAccount:666446126828-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor
gcloud secrets add-iam-policy-binding NEXT_PUBLIC_SUPABASE_URL --member=serviceAccount:666446126828-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor
gcloud secrets add-iam-policy-binding NEXT_PUBLIC_SUPABASE_ANON_KEY --member=serviceAccount:666446126828-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor
gcloud secrets add-iam-policy-binding NEXT_PUBLIC_BASE_URL --member=serviceAccount:666446126828-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor
