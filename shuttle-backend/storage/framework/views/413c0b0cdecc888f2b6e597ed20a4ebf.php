<?php $__env->startSection('title', 'Admin Login'); ?>

<?php $__env->startSection('content'); ?>
<div class="max-w-md mx-auto mt-12">
    <div class="glass-card p-6">
        <h2 class="text-2xl font-bold mb-4">Masuk Admin</h2>
        <?php if($errors->any()): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3"><?php echo e($errors->first()); ?></div>
        <?php endif; ?>
        <form method="POST" action="<?php echo e(route('admin.login.post')); ?>">
            <?php echo csrf_field(); ?>
            <div class="mb-3">
                <label class="block text-sm text-gray-700">Email</label>
                <input name="email" type="email" required class="w-full border px-3 py-2 rounded" />
            </div>
            <div class="mb-3">
                <label class="block text-sm text-gray-700">Password</label>
                <input name="password" type="password" required class="w-full border px-3 py-2 rounded" />
            </div>
            <div class="flex justify-end">
                <button class="bg-primary text-white px-4 py-2 rounded">Masuk</button>
            </div>
        </form>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('admin.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Program1\Shuttle(local)\shuttle-backend\resources\views/admin/login.blade.php ENDPATH**/ ?>